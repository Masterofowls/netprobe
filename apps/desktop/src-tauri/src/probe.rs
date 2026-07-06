use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};

const USER_AGENT: &str =
    "Mozilla/5.0 (compatible; NetProbe/1.5 Desktop; +https://netprobe.expo.app)";
const HEAD_RETRY_CODES: [u16; 3] = [403, 405, 406];

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DnsResult {
    pub resolved: bool,
    pub addresses: Vec<String>,
    pub latency_ms: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct TlsResult {
    pub valid: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub issuer: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expires_at: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub days_until_expiry: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub skipped: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct KeywordResult {
    pub matched: bool,
    pub keyword: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct GeoResult {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ip: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub country_code: Option<String>,
}

fn client(timeout_ms: u64) -> Result<reqwest::Client, String> {
    reqwest::Client::builder()
        .timeout(Duration::from_millis(timeout_ms.clamp(1000, 30000)))
        .user_agent(USER_AGENT)
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .map_err(|e| e.to_string())
}

fn parse_host(target_url: &str) -> Result<String, String> {
    url::Url::parse(target_url)
        .map(|u| u.host_str().unwrap_or("").to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn probe_http(target_url: String, timeout_ms: u64) -> Result<u16, String> {
    let client = client(timeout_ms)?;
    let head = client
        .head(&target_url)
        .header("Accept", "text/html,application/xhtml+xml")
        .send()
        .await;

    match head {
        Ok(response) => {
            let status = response.status().as_u16();
            if HEAD_RETRY_CODES.contains(&status) {
                let get = client
                    .get(&target_url)
                    .header("Accept", "text/html,application/xhtml+xml")
                    .send()
                    .await
                    .map_err(|e| e.to_string())?;
                return Ok(get.status().as_u16());
            }
            Ok(status)
        }
        Err(_) => {
            let get = client
                .get(&target_url)
                .header("Accept", "text/html,application/xhtml+xml")
                .send()
                .await
                .map_err(|e| e.to_string())?;
            Ok(get.status().as_u16())
        }
    }
}

#[tauri::command]
pub async fn probe_dns(target_url: String) -> DnsResult {
    let hostname = match parse_host(&target_url) {
        Ok(h) => h,
        Err(error) => {
            return DnsResult {
                resolved: false,
                addresses: vec![],
                latency_ms: None,
                error: Some(error),
            }
        }
    };

    let start = Instant::now();
    let client = match client(10_000) {
        Ok(c) => c,
        Err(error) => {
            return DnsResult {
                resolved: false,
                addresses: vec![],
                latency_ms: Some(start.elapsed().as_millis() as u64),
                error: Some(error),
            };
        }
    };

    let url = format!(
        "https://dns.google/resolve?name={}&type=A",
        urlencoding::encode(&hostname)
    );

    match client.get(&url).send().await {
        Ok(response) => match response.json::<serde_json::Value>().await {
            Ok(data) => {
                let addresses: Vec<String> = data
                    .get("Answer")
                    .and_then(|a| a.as_array())
                    .map(|answers| {
                        answers
                            .iter()
                            .filter(|entry| entry.get("type").and_then(|t| t.as_u64()) == Some(1))
                            .filter_map(|entry| {
                                entry.get("data").and_then(|d| d.as_str()).map(str::to_string)
                            })
                            .collect()
                    })
                    .unwrap_or_default();

                let empty = addresses.is_empty();
                DnsResult {
                    resolved: !empty,
                    addresses,
                    latency_ms: Some(start.elapsed().as_millis() as u64),
                    error: if empty {
                        Some("No A records found".into())
                    } else {
                        None
                    },
                }
            }
            Err(error) => DnsResult {
                resolved: false,
                addresses: vec![],
                latency_ms: Some(start.elapsed().as_millis() as u64),
                error: Some(error.to_string()),
            },
        },
        Err(error) => DnsResult {
            resolved: false,
            addresses: vec![],
            latency_ms: Some(start.elapsed().as_millis() as u64),
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub async fn probe_tls(target_url: String) -> TlsResult {
    let hostname = match parse_host(&target_url) {
        Ok(h) => h,
        Err(error) => {
            return TlsResult {
                valid: true,
                issuer: None,
                expires_at: None,
                days_until_expiry: None,
                error: Some(error),
                skipped: Some(true),
            };
        }
    };

    let client = match client(15_000) {
        Ok(c) => c,
        Err(error) => {
            return TlsResult {
                valid: true,
                issuer: None,
                expires_at: None,
                days_until_expiry: None,
                error: Some(error),
                skipped: Some(true),
            };
        }
    };

    let queries = [format!("%.{}", hostname), hostname.clone()];

    for query in queries {
        let url = format!(
            "https://crt.sh/?q={}&output=json",
            urlencoding::encode(&query)
        );

        let response = match client.get(&url).send().await {
            Ok(r) if r.status().is_success() => r,
            _ => continue,
        };

        let certs: Vec<serde_json::Value> = match response.json::<Vec<serde_json::Value>>().await {
            Ok(c) if !c.is_empty() => c,
            _ => continue,
        };

        if certs.is_empty() {
            continue;
        }

        let latest = certs.iter().max_by_key(|cert| {
            cert.get("not_after")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono_like_parse(s))
                .unwrap_or(0)
        });

        if let Some(cert) = latest {
            let expires_at = cert
                .get("not_after")
                .and_then(|v| v.as_str())
                .and_then(|s| chrono_like_parse(s));
            let now_ms = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .map(|d| d.as_millis() as i64)
                .unwrap_or(0);
            let days_until_expiry = expires_at.map(|exp| {
                ((exp - now_ms) as f64 / (1000.0 * 60.0 * 60.0 * 24.0)).ceil() as i64
            });

            return TlsResult {
                valid: expires_at.map(|exp| exp > now_ms).unwrap_or(true),
                issuer: cert
                    .get("issuer_name")
                    .and_then(|v| v.as_str())
                    .map(str::to_string),
                expires_at,
                days_until_expiry,
                error: None,
                skipped: None,
            };
        }
    }

    TlsResult {
        valid: true,
        issuer: None,
        expires_at: None,
        days_until_expiry: None,
        error: Some("Certificate lookup unavailable".into()),
        skipped: Some(true),
    }
}

fn chrono_like_parse(value: &str) -> Option<i64> {
    if let Ok(dt) = chrono::NaiveDateTime::parse_from_str(value, "%Y-%m-%dT%H:%M:%S") {
        return Some(dt.and_utc().timestamp_millis());
    }
    if let Ok(d) = chrono::NaiveDate::parse_from_str(value, "%Y-%m-%d") {
        return d
            .and_hms_opt(0, 0, 0)
            .map(|dt| dt.and_utc().timestamp_millis());
    }
    None
}

#[tauri::command]
pub async fn probe_keyword(
    target_url: String,
    keyword: String,
    timeout_ms: u64,
) -> KeywordResult {
    if keyword.trim().is_empty() {
        return KeywordResult {
            matched: true,
            keyword,
            error: Some("No keyword configured".into()),
        };
    }

    let client = match client(timeout_ms) {
        Ok(c) => c,
        Err(error) => {
            return KeywordResult {
                matched: false,
                keyword,
                error: Some(error),
            };
        }
    };

    match client
        .get(&target_url)
        .header("Accept", "text/html,application/xhtml+xml")
        .send()
        .await
    {
        Ok(response) => match response.text().await {
            Ok(body) => {
                let sample = body.chars().take(500_000).collect::<String>();
                let matched = sample
                    .to_lowercase()
                    .contains(&keyword.to_lowercase());
                KeywordResult {
                    matched,
                    keyword,
                    error: None,
                }
            }
            Err(error) => KeywordResult {
                matched: false,
                keyword,
                error: Some(error.to_string()),
            },
        },
        Err(error) => KeywordResult {
            matched: false,
            keyword,
            error: Some(error.to_string()),
        },
    }
}

#[tauri::command]
pub async fn probe_geo(target_url: String) -> GeoResult {
    let hostname = parse_host(&target_url).unwrap_or_default();
    if hostname.is_empty() {
        return GeoResult {
            ip: None,
            country_code: None,
        };
    }

    let client = match client(8_000) {
        Ok(c) => c,
        Err(_) => {
            return GeoResult {
                ip: None,
                country_code: None,
            };
        }
    };

    let url = format!(
        "http://ip-api.com/json/{}?fields=query,countryCode",
        urlencoding::encode(&hostname)
    );

    match client.get(&url).send().await {
        Ok(response) if response.status().is_success() => {
            match response.json::<serde_json::Value>().await {
                Ok(data) => GeoResult {
                    ip: data
                        .get("query")
                        .and_then(|v| v.as_str())
                        .map(str::to_string),
                    country_code: data
                        .get("countryCode")
                        .and_then(|v| v.as_str())
                        .map(str::to_string),
                },
                Err(_) => GeoResult {
                    ip: None,
                    country_code: None,
                },
            }
        }
        _ => GeoResult {
            ip: None,
            country_code: None,
        },
    }
}
