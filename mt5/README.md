# Jk Chartings MT5 Demo Bridge

The current Jk-Chartings repository is a static Next.js charting application. It is not itself an MT5 broker server.

This folder adds an MT5 Expert Advisor bridge for a demo setup. The bridge lets an MT5 terminal exchange demo account state and order commands with a separate Jk Chartings broker API.

Architecture:

Jk Chartings web app
-> Demo Broker API
-> MT5 Bridge EA
-> MT5 demo terminal

## MT5 setup

1. Open MetaTrader 5 Desktop.
2. Open MetaEditor.
3. Open JkChartingsBridge.mq5 and compile it.
4. In MT5 go to Tools -> Options -> Expert Advisors.
5. Enable WebRequest and add the exact ApiBaseUrl.
6. Attach JkChartingsBridge to a chart.
7. Set ApiBaseUrl, AccountId and ApiKey.
8. Keep Algo Trading enabled.

## API contract

GET /mt5/commands?accountId=demo-10001

Response:
{"commands":[{"id":"1","symbol":"EURUSD","side":"BUY","volume":0.01}]}

POST /mt5/command-result

Body:
{"commandId":"1","ok":true,"retcode":10009,"ticket":"12345"}

POST /mt5/state

Body contains accountId, balance, equity and positions[].

The API should authenticate the account and API key, validate symbols and volume, and record commands idempotently.

## Important

This EA is a bridge, not an MT5 server implementation. To make MT5 itself show a custom broker/server in the account/server list, you need licensed MT5 broker server infrastructure from MetaQuotes or an authorized provider.

