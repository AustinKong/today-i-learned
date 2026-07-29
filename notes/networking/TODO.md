# TODO: I havent seen this yet: <https://youtu.be/fIwOd4PToAY?si=7uBZmKdcxe4-H0YN>

Polling vs long polling vs http vs websockets vs sse high level.

importantly:

Polling is client -> server (has data?) -> server returns no. after awhile client polls again.

Long polling is client -> server. if server has no data, server does nothing and keeps the request open. until either there is data, sends to client and closes; or request timeout. either case, once the request closes, the client immediately sends a new request and keeps it idle/open until next action.

http: traditional client to server communication (one way), and only lasts for one request/response cycle

sse: server to client communication (one way), long lived communication

websockets: bidirection communication (two way), long lived communication.

- websocket first uses http handshake to establish the conneciton, then uses websocket protocol to keep it alive. so still needs http.
- the handshake uses header "upgrade websocket" http. to be researched more. server if supports websocket will send 101 switching protocols.
- websocket cons: complication. performance, many open websocket connections is heavy for server. need to handle disconnect/reconnect. must implement your own system for retries, idempotency, data transfer protocols or representational state (idk how better to describe)

## TODO: Maybe if there are more than one polling mechanisms we can make polling its own TIL
