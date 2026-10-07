import pytest
from flask import request

from bikespace_api import create_app  # type: ignore


@pytest.mark.parametrize(
    "proxy_hops, expected_remote_addr",
    [("1", "10.0.0.1"), ("2", "203.0.113.5")],
)
def test_trusted_proxy_headers(monkeypatch, proxy_hops, expected_remote_addr):
    """
    GIVEN a Flask application created with TRUSTED_PROXY_COUNT set
    WHEN a request arrives with X-Forwarded-* headers
    THEN the client address is taken from the trusted number of hops (ignoring
    spoofed entries further left) and the forwarded scheme and host are used
    """
    monkeypatch.setenv("TRUSTED_PROXY_COUNT", proxy_hops)
    app = create_app()
    app.config.from_object("bikespace_api.config.TestingConfig")

    @app.route("/_proxy_echo")
    def proxy_echo():
        return {"remote_addr": request.remote_addr, "host_url": request.host_url}

    response = app.test_client().get(
        "/_proxy_echo",
        headers={
            # spoofed by client, real client, inner proxy
            "X-Forwarded-For": "198.51.100.66, 203.0.113.5, 10.0.0.1",
            "X-Forwarded-Proto": "https",
            "X-Forwarded-Host": "api.example.com",
        },
    )

    assert response.status_code == 200
    assert response.json == {
        "remote_addr": expected_remote_addr,
        "host_url": "https://api.example.com/",
    }
