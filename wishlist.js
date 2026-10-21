/* Havenlist wishlist + share — shared by every page.
   Wishlists live in localStorage (this browser only). */
(function () {
  "use strict";
  var KEY = "havenlist.wishlists.v1";
  var ICONS = {"copy": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxNiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTExLjcwMzEgMS4zMTI1QzExLjEwMTYgMS4zMTI1IDEwLjUyNzMgMS41MDM5MSAxMC4wNjI1IDEuODMyMDNDOS43NjE3MiAxLjUzMTI1IDkuNDA2MjUgMS4yMzA0NyA5LjAyMzQ0IDEuMDExNzJDOS43NjE3MiAwLjM1NTQ2OSAxMC43MTg4IDAgMTEuNzAzMSAwQzEzLjk0NTMgMCAxNS43NSAxLjgzMjAzIDE1Ljc1IDQuMDc0MjJDMTUuNzUgNS4xNDA2MiAxNS4zMTI1IDYuMTc5NjkgMTQuNTc0MiA2Ljk0NTMxTDEyLjM4NjcgOS4xMDU0N0MxMS42NDg0IDkuODQzNzUgMTAuNjA5NCAxMC4yODEyIDkuNTE1NjIgMTAuMjgxMkM3LjI3MzQ0IDEwLjI4MTIgNS40Njg3NSA4LjQ3NjU2IDUuNDY4NzUgNi4yMzQzOEM1LjQ2ODc1IDUuNzQyMTkgNS41NTA3OCA1LjI1IDUuNzE0ODQgNC44MTI1QzUuODUxNTYgNC40NTcwMyA2LjIzNDM4IDQuMjkyOTcgNi41NjI1IDQuNDI5NjlDNi45MTc5NyA0LjUzOTA2IDcuMDgyMDMgNC45MjE4OCA2Ljk0NTMxIDUuMjVDNi44MzU5NCA1LjU3ODEyIDYuNzgxMjUgNS44Nzg5MSA2Ljc4MTI1IDYuMjM0MzhDNi43ODEyNSA3LjczODI4IDguMDExNzIgOC45Njg3NSA5LjU0Mjk3IDguOTY4NzVDMTAuMjUzOSA4Ljk2ODc1IDEwLjk2NDggOC42OTUzMSAxMS40ODQ0IDguMTc1NzhMMTMuNjQ0NSA2LjAxNTYyQzE0LjEzNjcgNS40OTYwOSAxNC40Mzc1IDQuNzg1MTYgMTQuNDM3NSA0LjA3NDIyQzE0LjQzNzUgMi41NDI5NyAxMy4yMDcgMS4zMTI1IDExLjcwMzEgMS4zMTI1Wk02LjIzNDM4IDIuODQzNzVDNS40OTYwOSAyLjg0Mzc1IDQuNzg1MTYgMy4xNDQ1MyA0LjI5Mjk3IDMuNjM2NzJMMi4xMDU0NyA1LjgyNDIyQzEuNjEzMjggNi4zMTY0MSAxLjMxMjUgNy4wMjczNCAxLjMxMjUgNy43NjU2MkMxLjMxMjUgOS4yNjk1MyAyLjU0Mjk3IDEwLjUgNC4wNzQyMiAxMC41QzQuNjQ4NDQgMTAuNSA1LjIyMjY2IDEwLjMwODYgNS42ODc1IDkuOTgwNDdDNS45ODgyOCAxMC4yODEyIDYuMzQzNzUgMTAuNTgyIDYuNzI2NTYgMTAuODAwOEM1Ljk4ODI4IDExLjQ1NyA1LjA1ODU5IDExLjgxMjUgNC4wNzQyMiAxMS44MTI1QzEuODMyMDMgMTEuODEyNSAwIDEwLjAwNzggMCA3Ljc2NTYyQzAgNi42NzE4OCAwLjQzNzUgNS42MzI4MSAxLjIwMzEyIDQuODk0NTNMMy4zNjMyOCAyLjcwNzAzQzQuMTAxNTYgMS45Njg3NSA1LjE0MDYyIDEuNTMxMjUgNi4yMzQzOCAxLjUzMTI1QzguNDc2NTYgMS41MzEyNSAxMC4yODEyIDMuMzM1OTQgMTAuMjgxMiA1LjU3ODEyQzEwLjI4MTIgNi4wNzAzMSAxMC4xOTkyIDYuNTYyNSAxMC4wMzUyIDdDOS44OTg0NCA3LjM1NTQ3IDkuNTE1NjIgNy41MTk1MyA5LjE4NzUgNy4zODI4MUM4LjgzMjAzIDcuMjczNDQgOC42Njc5NyA2Ljg5MDYyIDguODA0NjkgNi41NjI1QzguOTE0MDYgNi4yNjE3MiA4Ljk2ODc1IDUuOTMzNTkgOC45Njg3NSA1LjYwNTQ3QzguOTY4NzUgNC4wNzQyMiA3LjczODI4IDIuODQzNzUgNi4yMzQzOCAyLjg0Mzc1WiIgZmlsbD0iIzFFMUUxRSIvPgo8L3N2Zz4K", "email": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTEiIHZpZXdCb3g9IjAgMCAxNCAxMSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEuNjY3OTcgMEgxMi4zMzJDMTMuMjYxNyAwIDE0IDAuNzY1NjI1IDE0IDEuNjY3OTdDMTQgMS42OTUzMSAxNCAxLjcyMjY2IDE0IDEuNzVWOC43NUMxNCA5LjcwNzAzIDEzLjIwNyAxMC41IDEyLjI1IDEwLjVIMS43NUMwLjc5Mjk2OSAxMC41IDAgOS43MDcwMyAwIDguNzVWMS43NUMwIDEuNzIyNjYgMCAxLjY5NTMxIDAgMS42Njc5N0MwIDAuNzY1NjI1IDAuNzY1NjI1IDAgMS42Njc5NyAwWk0xMi42ODc1IDMuNUw4LjQ0OTIyIDYuNzI2NTZDNy42MDE1NiA3LjM4MjgxIDYuMzk4NDQgNy4zODI4MSA1LjU1MDc4IDYuNzI2NTZMMS4zMTI1IDMuNVY4Ljc1QzEuMzEyNSA4Ljk5NjA5IDEuNTAzOTEgOS4xODc1IDEuNzUgOS4xODc1SDEyLjI1QzEyLjQ5NjEgOS4xODc1IDEyLjY4NzUgOC45OTYwOSAxMi42ODc1IDguNzVWMy41Wk0xLjMxMjUgMS42Njc5N0MxLjMxMjUgMS44MDQ2OSAxLjM2NzE5IDEuOTE0MDYgMS40NDkyMiAxLjk2ODc1TDYuMzQzNzUgNS42ODc1QzYuNzI2NTYgNS45NjA5NCA3LjI3MzQ0IDUuOTYwOTQgNy42NTYyNSA1LjY4NzVMMTIuNTUwOCAxLjk2ODc1QzEyLjYzMjggMS45MTQwNiAxMi42ODc1IDEuODA0NjkgMTIuNjg3NSAxLjY2Nzk3QzEyLjY4NzUgMS40NzY1NiAxMi41MjM0IDEuMzEyNSAxMi4zMzIgMS4zMTI1SDEuNjY3OTdDMS40NzY1NiAxLjMxMjUgMS4zMTI1IDEuNDc2NTYgMS4zMTI1IDEuNjY3OTdaIiBmaWxsPSIjMUUxRTFFIi8+Cjwvc3ZnPgo=", "message": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEuMzEyNSAxLjk2ODc1VjcuMjE4NzVDMS4zMTI1IDcuNTc0MjIgMS42MTMyOCA3Ljg3NSAxLjk2ODc1IDcuODc1SDIuODQzNzVDMy4xOTkyMiA3Ljg3NSAzLjUgOC4xNzU3OCAzLjUgOC41MzEyNVY5LjM3ODkxTDUuMDAzOTEgOC4yMzA0N0M1LjMwNDY5IDguMDExNzIgNS42ODc1IDcuODc1IDYuMDcwMzEgNy44NzVIOC41MzEyNUM4Ljg4NjcyIDcuODc1IDkuMTg3NSA3LjU3NDIyIDkuMTg3NSA3LjIxODc1VjEuOTY4NzVDOS4xODc1IDEuNjEzMjggOC44ODY3MiAxLjMxMjUgOC41MzEyNSAxLjMxMjVIMS45Njg3NUMxLjYxMzI4IDEuMzEyNSAxLjMxMjUgMS42MTMyOCAxLjMxMjUgMS45Njg3NVpNMS45Njg3NSAwSDguNTMxMjVDOS42MjUgMCAxMC41IDAuODc1IDEwLjUgMS45Njg3NVY3LjIxODc1QzEwLjUgOC4zMTI1IDkuNjI1IDkuMTg3NSA4LjUzMTI1IDkuMTg3NUg2LjA3MDMxQzUuOTYwOTQgOS4xODc1IDUuODc4OTEgOS4yMTQ4NCA1Ljc5Njg4IDkuMjY5NTNMMy4yNTM5MSAxMS4yMzgzQzMuMDM1MTYgMTEuNDAyMyAyLjc4OTA2IDExLjQyOTcgMi41NDI5NyAxMS4zMjAzQzIuMzI0MjIgMTEuMjEwOSAyLjE4NzUgMTAuOTY0OCAyLjE4NzUgMTAuNzE4OFY5LjE4NzVIMS45Njg3NUMwLjg3NSA5LjE4NzUgMCA4LjMxMjUgMCA3LjIxODc1VjEuOTY4NzVDMCAwLjg3NSAwLjg3NSAwIDEuOTY4NzUgMFpNNi41NjI1IDEwLjVWMTEuNTkzOEM2LjU2MjUgMTEuOTQ5MiA2Ljg2MzI4IDEyLjI1IDcuMjE4NzUgMTIuMjVIOS42Nzk2OUMxMC4wODk4IDEyLjI1IDEwLjQ0NTMgMTIuMzg2NyAxMC43NDYxIDEyLjYwNTVMMTIuMjUgMTMuNzUzOVYxMi45MDYyQzEyLjI1IDEyLjU1MDggMTIuNTUwOCAxMi4yNSAxMi45MDYyIDEyLjI1SDEzLjc4MTJDMTQuMTM2NyAxMi4yNSAxNC40Mzc1IDExLjk0OTIgMTQuNDM3NSAxMS41OTM4VjYuMzQzNzVDMTQuNDM3NSA1Ljk4ODI4IDE0LjEzNjcgNS42ODc1IDEzLjc4MTIgNS42ODc1SDExLjgxMjVWNC4zNzVIMTMuNzgxMkMxNC44NzUgNC4zNzUgMTUuNzUgNS4yNSAxNS43NSA2LjM0Mzc1VjExLjU5MzhDMTUuNzUgMTIuNjg3NSAxNC44NzUgMTMuNTYyNSAxMy43ODEyIDEzLjU2MjVIMTMuNTYyNVYxNS4wOTM4QzEzLjU2MjUgMTUuMzM5OCAxMy40MjU4IDE1LjU4NTkgMTMuMjA3IDE1LjY5NTNDMTIuOTYwOSAxNS44MDQ3IDEyLjcxNDggMTUuNzc3MyAxMi40OTYxIDE1LjYxMzNMOS45NTMxMiAxMy42NDQ1QzkuODcxMDkgMTMuNTg5OCA5Ljc4OTA2IDEzLjU2MjUgOS42Nzk2OSAxMy41NjI1SDcuMjE4NzVDNi4xMjUgMTMuNTYyNSA1LjI1IDEyLjY4NzUgNS4yNSAxMS41OTM4VjExLjM0NzdMNi4zNzEwOSAxMC41SDYuNTYyNVoiIGZpbGw9IiMxRTFFMUUiLz4KPC9zdmc+Cg==", "whatsapp": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwLjQxOCAxLjc3NzM0QzExLjU2NjQgMi45MjU3OCAxMi4yNSA0LjQ1NzAzIDEyLjI1IDYuMDcwMzFDMTIuMjUgOS40MzM1OSA5LjQ2MDk0IDEyLjE0MDYgNi4xMjUgMTIuMTQwNkM1LjExMzI4IDEyLjE0MDYgNC4xMDE1NiAxMS44OTQ1IDMuMjI2NTYgMTEuNDAyM0wwIDEyLjI1TDAuODc1IDkuMTA1NDdDMC4zMjgxMjUgOC4xNzU3OCAwLjA1NDY4NzUgNy4xMzY3MiAwLjA1NDY4NzUgNi4wNzAzMUMwLjA1NDY4NzUgMi43MzQzOCAyLjc4OTA2IDAgNi4xMjUgMEM3LjczODI4IDAgOS4yNjk1MyAwLjYyODkwNiAxMC40MTggMS43NzczNFpNNi4xMjUgMTEuMTI4OUM4LjkxNDA2IDExLjEyODkgMTEuMjM4MyA4Ljg1OTM4IDExLjIzODMgNi4wNzAzMUMxMS4yMzgzIDQuNzMwNDcgMTAuNjM2NyAzLjQ3MjY2IDkuNjc5NjkgMi41MTU2MkM4Ljc1IDEuNTU4NTkgNy40NjQ4NCAxLjAzOTA2IDYuMTI1IDEuMDM5MDZDMy4zMzU5NCAxLjAzOTA2IDEuMDY2NDEgMy4yODEyNSAxLjA2NjQxIDYuMDcwMzFDMS4wNjY0MSA3LjAyNzM0IDEuMzM5ODQgNy45NTcwMyAxLjg1OTM4IDguNzVMMS45Njg3NSA4Ljk0MTQxTDEuNDQ5MjIgMTAuODAwOEwzLjM2MzI4IDEwLjMwODZMMy41NTQ2OSAxMC40MThDNC4zMjAzMSAxMC44ODI4IDUuMjIyNjYgMTEuMTI4OSA2LjEyNSAxMS4xMjg5Wk04Ljg4NjcyIDcuMzU1NDdDOS4wNTA3OCA3LjQxMDE2IDkuMTMyODEgNy40NjQ4NCA5LjE4NzUgNy41MTk1M0M5LjIxNDg0IDcuNTc0MjIgOS4yMTQ4NCA3LjkwMjM0IDkuMDc4MTIgOC4yNTc4MUM4Ljk2ODc1IDguNjEzMjggOC4zNjcxOSA4LjkxNDA2IDguMDY2NDEgOC45Njg3NUM3LjU3NDIyIDkuMDUwNzggNy4yMTg3NSA4Ljk5NjA5IDYuMjM0MzggOC41ODU5NEM0LjczMDQ3IDcuOTI5NjkgMy43MTg3NSA2LjM5ODQ0IDMuNjY0MDYgNi4yODkwNkMzLjU4MjAzIDYuMjA3MDMgMy4wMzUxNiA1LjQ2ODc1IDMuMDM1MTYgNC43MzA0N0MzLjAzNTE2IDMuOTkyMTkgMy40MTc5NyAzLjYwOTM4IDMuNTU0NjkgMy40NzI2NkMzLjcxODc1IDMuMzA4NTkgMy44ODI4MSAzLjI4MTI1IDMuOTY0ODQgMy4yODEyNUM0LjA3NDIyIDMuMjgxMjUgNC4xODM1OSAzLjI4MTI1IDQuMjY1NjIgMy4yODEyNUM0LjM0NzY2IDMuMjgxMjUgNC40ODQzOCAzLjI1MzkxIDQuNTkzNzUgMy41MjczNEM0LjczMDQ3IDMuODI4MTIgNS4wMzEyNSA0LjU5Mzc1IDUuMDU4NTkgNC42NzU3OEM1LjExMzI4IDQuNzMwNDcgNS4xNDA2MiA0LjgzOTg0IDUuMDg1OTQgNC45MjE4OEM0Ljc4NTE2IDUuNDk2MDkgNC40ODQzOCA1LjQ5NjA5IDQuNjQ4NDQgNS43Njk1M0M1LjIyMjY2IDYuNzUzOTEgNS44MjQyMiA3LjEwOTM4IDYuNjk5MjIgNy41NzQyMkM2Ljg2MzI4IDcuNjI4OTEgNi45NDUzMSA3LjYyODkxIDcuMDI3MzQgNy41MTk1M0M3LjEwOTM4IDcuNDEwMTYgNy40MTAxNiA3LjA4MjAzIDcuNTE5NTMgNi45MTc5N0M3LjYwMTU2IDYuNzgxMjUgNy43MTA5NCA2LjgwODU5IDcuODQ3NjYgNi44NjMyOEM3Ljk4NDM4IDYuODkwNjIgOC43NSA3LjI3MzQ0IDguODg2NzIgNy4zNTU0N1oiIGZpbGw9IiMxRTFFMUUiLz4KPC9zdmc+Cg==", "instagram": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTMiIHZpZXdCb3g9IjAgMCAxMyAxMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYuMTExMzMgMi45OTQxNEM3Ljg2MTMzIDIuOTk0MTQgOS4yNTU4NiA0LjQxNjAyIDkuMjU1ODYgNi4xMzg2N0M5LjI1NTg2IDcuODg4NjcgNy44MzM5OCA5LjI4MzIgNi4xMTEzMyA5LjI4MzJDNC4zNjEzMyA5LjI4MzIgMi45NjY4IDcuODYxMzMgMi45NjY4IDYuMTM4NjdDMi45NjY4IDQuMzg4NjcgNC4zODg2NyAyLjk5NDE0IDYuMTExMzMgMi45OTQxNFpNNi4xMTEzMyA0LjA4Nzg5QzQuOTYyODkgNC4xMTUyMyA0LjA2MDU1IDUuMDE3NTggNC4wNjA1NSA2LjEzODY3QzQuMDg3ODkgNy4yODcxMSA0Ljk5MDIzIDguMTg5NDUgNi4xMTEzMyA4LjE4OTQ1QzcuMjU5NzcgOC4xNjIxMSA4LjE2MjExIDcuMjU5NzcgOC4xNjIxMSA2LjEzODY3QzguMTM0NzcgNC45OTAyMyA3LjIzMjQyIDQuMDg3ODkgNi4xMTEzMyA0LjA4Nzg5Wk04LjY1NDMgMi44NTc0MkM4LjY1NDMgMy4yNjc1OCA4Ljk4MjQyIDMuNTk1NyA5LjM5MjU4IDMuNTk1N0M5LjgwMjczIDMuNTk1NyAxMC4xMzA5IDMuMjY3NTggMTAuMTMwOSAyLjg1NzQyQzEwLjEzMDkgMi40NDcyNyA5LjgwMjczIDIuMTQ2NDggOS4zOTI1OCAyLjE0NjQ4QzguOTgyNDIgMi4xNDY0OCA4LjY1NDMgMi40NDcyNyA4LjY1NDMgMi44NTc0MlpNMTIuMjA5IDMuNjIzMDVDMTIuMjYzNyA0LjYzNDc3IDEyLjI2MzcgNy42NDI1OCAxMi4yMDkgOC42NTQzQzEyLjE1NDMgOS42Mzg2NyAxMS45MzU1IDEwLjUxMzcgMTEuMjI0NiAxMS4yMjQ2QzEwLjQ4NjMgMTEuOTYyOSA5LjYzODY3IDEyLjE4MTYgOC42NTQzIDEyLjIwOUM3LjY0MjU4IDEyLjI5MSA0LjYwNzQyIDEyLjI5MSAzLjU5NTcgMTIuMjA5QzIuNjExMzMgMTIuMTgxNiAxLjczNjMzIDExLjkzNTUgMS4wMjUzOSAxMS4yMjQ2QzAuMzE0NDUzIDEwLjUxMzcgMC4wNjgzNTk0IDkuNjM4NjcgMC4wNDEwMTU2IDguNjU0M0MtMC4wMTM2NzE5IDcuNjQyNTggLTAuMDEzNjcxOSA0LjYwNzQyIDAuMDQxMDE1NiAzLjU5NTdDMC4wOTU3MDMxIDIuNjM4NjcgMC4zMTQ0NTMgMS43NjM2NyAxLjAyNTM5IDEuMDUyNzNDMS43MzYzMyAwLjMxNDQ1MyAyLjYxMTMzIDAuMDk1NzAzMSAzLjU5NTcgMC4wNDEwMTU2QzQuNjA3NDIgLTAuMDEzNjcxOSA3LjY0MjU4IC0wLjAxMzY3MTkgOC42NTQzIDAuMDQxMDE1NkM5LjYzODY3IDAuMDk1NzAzMSAxMC40ODYzIDAuMzE0NDUzIDExLjIyNDYgMS4wNTI3M0MxMS45MzU1IDEuNzYzNjcgMTIuMTU0MyAyLjYzODY3IDEyLjIwOSAzLjYyMzA1Wk0xMC44OTY1IDkuNzQ4MDVDMTEuMjI0NiA4Ljk1NTA4IDExLjE0MjYgNy4wNDEwMiAxMS4xNDI2IDYuMTM4NjdDMTEuMTQyNiA1LjIzNjMzIDExLjIyNDYgMy4zMjIyNyAxMC44OTY1IDIuNTI5M0MxMC42Nzc3IDEuOTgyNDIgMTAuMjY3NiAxLjU3MjI3IDkuNzIwNyAxLjM1MzUyQzguOTI3NzMgMS4wNTI3MyA3LjAxMzY3IDEuMTA3NDIgNi4xMTEzMyAxLjEwNzQyQzUuMjM2MzMgMS4xMDc0MiAzLjMyMjI3IDEuMDUyNzMgMi41MDE5NSAxLjM1MzUyQzEuOTgyNDIgMS41NzIyNyAxLjU0NDkyIDEuOTgyNDIgMS4zNTM1MiAyLjUyOTNDMS4wMjUzOSAzLjMyMjI3IDEuMTA3NDIgNS4yMzYzMyAxLjEwNzQyIDYuMTM4NjdDMS4xMDc0MiA3LjA0MTAyIDEuMDI1MzkgOC45NTUwOCAxLjM1MzUyIDkuNzQ4MDVDMS41NzIyNyAxMC4yOTQ5IDEuOTgyNDIgMTAuNzA1MSAyLjUwMTk1IDEwLjkyMzhDMy4zMjIyNyAxMS4yMjQ2IDUuMjM2MzMgMTEuMTY5OSA2LjExMTMzIDExLjE2OTlDNy4wMTM2NyAxMS4xNjk5IDguOTI3NzMgMTEuMjI0NiA5LjcyMDcgMTAuOTIzOEMxMC4yNjc2IDEwLjcwNTEgMTAuNjc3NyAxMC4yOTQ5IDEwLjg5NjUgOS43NDgwNVoiIGZpbGw9IiMxRTFFMUUiLz4KPC9zdmc+Cg==", "facebook": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE0IDdDMTQgMTAuNTgyIDExLjMyMDMgMTMuNTM1MiA3Ljg0NzY2IDEzLjk0NTNWOS4xMzI4MUg5LjczNDM4TDEwLjE0NDUgN0g3Ljg0NzY2VjYuMjM0MzhDNy44NDc2NiA1LjExMzI4IDguMjg1MTYgNC42NzU3OCA5LjQzMzU5IDQuNjc1NzhDOS43ODkwNiA0LjY3NTc4IDEwLjA4OTggNC42NzU3OCAxMC4yNTM5IDQuNzAzMTJWMi43NjE3MkM5LjkyNTc4IDIuNjc5NjkgOS4xNjAxNiAyLjU5NzY2IDguNzIyNjYgMi41OTc2NkM2LjM5ODQ0IDIuNTk3NjYgNS4zMDQ2OSAzLjY5MTQxIDUuMzA0NjkgNi4wNzAzMVY3SDMuODU1NDdWOS4xMzI4MUg1LjMwNDY5VjEzLjgwODZDMi4yNjk1MyAxMy4wNDMgMCAxMC4yODEyIDAgN0MwIDMuMTQ0NTMgMy4xNDQ1MyAwIDcgMEMxMC44NTU1IDAgMTQgMy4xNDQ1MyAxNCA3WiIgZmlsbD0iIzFFMUUxRSIvPgo8L3N2Zz4K", "twitter": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxNCAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyLjU1MDggMi44NDM3NUMxMi41NzgxIDIuOTUzMTIgMTIuNTc4MSAzLjA4OTg0IDEyLjU3ODEgMy4xOTkyMkMxMi41NzgxIDcgOS42Nzk2OSAxMS4zNzUgNC40MDIzNCAxMS4zNzVDMi43ODkwNiAxMS4zNzUgMS4yNTc4MSAxMC45MTAyIDAgMTAuMDg5OEMwLjIxODc1IDEwLjExNzIgMC40NjQ4NDQgMTAuMTE3MiAwLjY4MzU5NCAxMC4xMTcyQzIuMDIzNDQgMTAuMTE3MiAzLjI4MTI1IDkuNjc5NjkgNC4yNjU2MiA4Ljg4NjcyQzMuMDA3ODEgOC44NTkzOCAxLjk0MTQxIDguMDM5MDYgMS41ODU5NCA2LjkxNzk3QzEuNzUgNi45NDUzMSAxLjk0MTQxIDYuOTQ1MzEgMi4xMDU0NyA2Ljk0NTMxQzIuMzc4OTEgNi45NDUzMSAyLjYyNSA2LjkxNzk3IDIuODcxMDkgNi44NjMyOEMxLjU1ODU5IDYuNTg5ODQgMC41NzQyMTkgNS40NDE0MSAwLjU3NDIxOSA0LjA0Njg4VjMuOTkyMTlDMC45NTcwMzEgNC4yMTA5NCAxLjM5NDUzIDQuMzQ3NjYgMS44NTkzOCA0LjM3NUMxLjA5Mzc1IDMuODU1NDcgMC41NzQyMTkgMi45ODA0NyAwLjU3NDIxOSAxLjk2ODc1QzAuNTc0MjE5IDEuNDQ5MjIgMC43MzgyODEgMC45NTcwMzEgMC45ODQzNzUgMC41MTk1MzFDMi4zNzg5MSAyLjI2OTUzIDQuNTExNzIgMy4zOTA2MiA2Ljg5MDYyIDMuNTI3MzRDNi44NjMyOCAzLjMwODU5IDYuODM1OTQgMy4wODk4NCA2LjgzNTk0IDIuODcxMDlDNi44MzU5NCAxLjI4NTE2IDguMDkzNzUgMCA5LjY3OTY5IDBDMTAuNTI3MyAwIDExLjI2NTYgMC4zNTU0NjkgMTEuNzg1MiAwLjkwMjM0NEMxMi40NDE0IDAuNzkyOTY5IDEzLjA3MDMgMC41NDY4NzUgMTMuNjE3MiAwLjIxODc1QzEzLjM5ODQgMC44NzUgMTIuOTMzNiAxLjQ0OTIyIDEyLjM1OTQgMS44MDQ2OUMxMi45MzM2IDEuNzIyNjYgMTMuNDgwNSAxLjU4NTk0IDE0IDEuMzM5ODRDMTMuNjE3MiAxLjkxNDA2IDEzLjEyNSAyLjQzMzU5IDEyLjU1MDggMi44NDM3NVoiIGZpbGw9IiMxRTFFMUUiLz4KPC9zdmc+Cg==", "others": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMyIgdmlld0JveD0iMCAwIDEzIDMiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMi4yNSAxLjMxMjVDMTIuMjUgMi4wNTA3OCAxMS42NzU4IDIuNjI1IDEwLjkzNzUgMi42MjVDMTAuMTk5MiAyLjYyNSA5LjYyNSAyLjA1MDc4IDkuNjI1IDEuMzEyNUM5LjYyNSAwLjU3NDIxOSAxMC4xOTkyIDAgMTAuOTM3NSAwQzExLjY3NTggMCAxMi4yNSAwLjU3NDIxOSAxMi4yNSAxLjMxMjVaTTcuNDM3NSAxLjMxMjVDNy40Mzc1IDIuMDUwNzggNi44NjMyOCAyLjYyNSA2LjEyNSAyLjYyNUM1LjM4NjcyIDIuNjI1IDQuODEyNSAyLjA1MDc4IDQuODEyNSAxLjMxMjVDNC44MTI1IDAuNTc0MjE5IDUuMzg2NzIgMCA2LjEyNSAwQzYuODYzMjggMCA3LjQzNzUgMC41NzQyMTkgNy40Mzc1IDEuMzEyNVpNMS4zMTI1IDIuNjI1QzAuNTc0MjE5IDIuNjI1IDAgMi4wNTA3OCAwIDEuMzEyNUMwIDAuNTc0MjE5IDAuNTc0MjE5IDAgMS4zMTI1IDBDMi4wNTA3OCAwIDIuNjI1IDAuNTc0MjE5IDIuNjI1IDEuMzEyNUMyLjYyNSAyLjA1MDc4IDIuMDUwNzggMi42MjUgMS4zMTI1IDIuNjI1WiIgZmlsbD0iIzFFMUUxRSIvPgo8L3N2Zz4K"};

  /* ---------- store ---------- */
  function read() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.lists)) { d.visited = d.visited || []; d.lists.forEach(function (l) { if (!Array.isArray(l.items)) l.items = []; }); return d; }
    } catch (e) {}
    return { lists: [], last: null, visited: [] };
  }
  var memory = null;
  function load() { return memory || (memory = read()); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(memory)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("wishlist:change"));
  }
  window.addEventListener("storage", function (e) { if (e.key === KEY) { memory = null; sync(); document.dispatchEvent(new CustomEvent("wishlist:change")); } });

  function uid() { return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function listingById(id) {
    var a = window.HavenlistStore ? HavenlistStore.all() : [];
    for (var i = 0; i < a.length; i++) if (a[i].id === id) return a[i];
    return null;
  }
  function savedIn(id) { return load().lists.filter(function (l) { return l.items.indexOf(id) > -1; }); }
  function isSaved(id) { return savedIn(id).length > 0; }

  function create(name, quiet) {
    var d = load();
    var l = { id: uid(), name: (name || "").trim() || "My wishlist", items: [] };
    d.lists.push(l); d.last = l.id; if (!quiet) save();
    return l;
  }
  function removeList(id) {
    var d = load();
    d.lists = d.lists.filter(function (l) { return l.id !== id; });
    if (d.last === id) d.last = d.lists.length ? d.lists[d.lists.length - 1].id : null;
    save(); sync();
  }
  /* Heart: add to the last-used list (creating "My wishlist" the first time), or remove everywhere */
  function toggle(id, from) {
    var d = load(), where = savedIn(id);
    if (where.length) {
      where.forEach(function (l) { l.items.splice(l.items.indexOf(id), 1); });
      save(); sync(); toast("Removed from wishlist");
      return false;
    }
    var target = d.lists.filter(function (l) { return l.id === d.last; })[0] || d.lists[0] || create("My wishlist", true);
    target.items.push(id); d.last = target.id; save(); sync();
    toast("Saved to " + target.name);
    if (from) fly(from);
    return true;
  }
  function visit(id) {
    var d = load();
    d.visited = [id].concat(d.visited.filter(function (x) { return x !== id; })).slice(0, 12);
    save();
  }

  /* ---------- styles ---------- */
  var css = '' +
  '.hlw-backdrop{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .25s ease}' +
  '.hlw-backdrop.is-open{opacity:1}' +
  '.hlw-backdrop--clear{background:transparent;display:block;padding:0}' +
  '.hlw-card{position:relative;width:100%;max-width:480px;background:#fff;border-radius:24px;color:#1e1e1e;font-family:"Geist",system-ui,sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.18);transform:translateY(10px) scale(.98);opacity:0;transition:transform .3s cubic-bezier(.4,0,.2,1),opacity .25s ease}' +
  '.is-open>.hlw-card,.hlw-card.is-open{transform:none;opacity:1}' +
  '.hlw-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px 24px;height:64px}' +
  '.hlw-title{margin:0;font:500 24px/1.2 "Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.02em;white-space:nowrap}' +
  '.hlw-x{width:32px;height:32px;margin-right:-8px;border:0;background:none;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;color:#1e1e1e;transition:background .2s}' +
    '.hlw-x path{fill:none;stroke:currentColor;stroke-width:1.35;stroke-linecap:round;stroke-dasharray:100;stroke-dashoffset:0}' +
  '.hlw-x:hover path{animation:hlw-draw .72s cubic-bezier(.4,0,.2,1) both}' +
  '.hlw-x:hover path+path{animation-delay:.14s}' +
  '@keyframes hlw-draw{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}' +
  '.hlw-body{padding:16px 24px 24px}' +
  '.hlw-body--text{padding:24px;font:400 16px/1.3 "Geist",system-ui,sans-serif;letter-spacing:-.01em;color:rgba(30,30,30,.9)}' +
  '.hlw-label{display:block;font-size:14px;letter-spacing:-.01em;margin-bottom:8px}' +
  '.hlw-input{width:100%;height:40px;padding:4px 14px;border:1px solid rgba(30,30,30,.13);border-radius:46px;box-shadow:0 3px 10px rgba(0,0,0,.03);font:400 14px "Geist",system-ui,sans-serif;color:#1e1e1e;outline:none;background:#fff;transition:border-color .2s}' +
  '.hlw-input::placeholder{color:rgba(30,30,30,.7)}' +
  '.hlw-input:focus{border-color:rgba(30,30,30,.5)}' +
  '.hlw-foot{display:flex;align-items:center;justify-content:space-between;gap:24px;padding:16px 24px;border-top:1px solid rgba(30,30,30,.1)}' +
  '.hlw-foot--end{justify-content:flex-end}' +
  '.hlw-cancel{border:0;background:none;padding:0;cursor:pointer;font:500 16px/1.4 "Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.01em;color:rgba(30,30,30,.7);transition:color .2s}' +
  '.hlw-cancel:hover{color:#1e1e1e}' +
  '.hlw-primary{height:42px;padding:0 15px;min-width:78px;border:1px solid #1e1e1e;border-radius:80px;cursor:pointer;color:#fff;font:500 16px/1 "Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.01em;background-image:linear-gradient(180deg,rgba(0,0,0,.7),transparent),linear-gradient(#1e1e1e,#1e1e1e);transition:opacity .2s,transform .2s}' +
  '.hlw-primary:hover{transform:translateY(-1px)}' +
  '.hlw-primary:disabled{opacity:.4;cursor:not-allowed;transform:none}' +
  /* share */
  '.hlw-share{position:absolute;width:480px;max-width:calc(100vw - 32px);transform-origin:top right}' +
  '.hlw-item{display:flex;align-items:center;gap:12px;padding:8px 24px;height:80px}' +
  '.hlw-item__in{flex:1;min-width:0;height:64px;display:flex;align-items:center;gap:12px;justify-content:space-between;border-radius:16px;box-shadow:0 2px 4px rgba(0,0,0,.03)}' +
  '.hlw-item__l{display:flex;align-items:center;gap:12px;min-width:0}' +
  '.hlw-item__img{width:48px;height:48px;border-radius:8px;object-fit:cover;background:#ddd;flex:none}' +
  '.hlw-item__t{min-width:0}' +
  '.hlw-item__name{font:500 16px/1.4 "Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.hlw-item__addr{font-size:14px;line-height:1.4;color:rgba(30,30,30,.8);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
  '.hlw-item__price{font-size:14px;color:rgba(30,30,30,.8);white-space:nowrap}' +
  '.hlw-opts{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 24px 24px}' +
  '.hlw-opt{height:40px;display:flex;align-items:center;gap:8px;padding:0 12px;border:1px solid rgba(30,30,30,.07);border-radius:12px;background:#fff;box-shadow:0 2px 4px rgba(0,0,0,.03);cursor:pointer;font:400 14px "Inter Display","Inter",system-ui,sans-serif;letter-spacing:-.01em;color:#1e1e1e;transition:background .2s,border-color .2s}' +
  '.hlw-opt:hover{border-color:rgba(30,30,30,.18)}' +
  '.hlw-opt img{width:16px;height:16px;object-fit:contain;flex:none}' +
  '@media (max-width:560px){.hlw-share{left:16px!important;right:16px;width:auto}.hlw-title{font-size:20px}}' +
  /* card hearts + toast */
  '.card__fav.is-saved .heart-outline,.icon-btn--fav.is-saved .heart-outline{fill:currentColor;animation:none;stroke-dashoffset:0}' +
  '.hlw-toast{position:fixed;left:50%;bottom:28px;z-index:500;transform:translate(-50%,20px);padding:12px 18px;border-radius:999px;background:#1e1e1e;color:#fff;font:500 14px "Geist",system-ui,sans-serif;opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;white-space:nowrap}' +
  '.hlw-toast.is-visible{opacity:1;transform:translate(-50%,0)}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var tt, tel;
  function toast(msg) {
    if (!tel) { tel = document.createElement("div"); tel.className = "hlw-toast"; tel.setAttribute("role", "status"); document.body.appendChild(tel); }
    tel.textContent = msg; void tel.offsetWidth; tel.classList.add("is-visible");
    clearTimeout(tt); tt = setTimeout(function () { tel.classList.remove("is-visible"); }, 2200);
  }
  var X = '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path pathLength="100" d="M2.5 2.5L13.5 13.5"/><path pathLength="100" d="M13.5 2.5L2.5 13.5"/></svg>';

  var openEl = null, openCleanup = null;
  function close(cb) {
    if (!openEl) return;
    var el = openEl, clean = openCleanup; openEl = null; openCleanup = null;
    el.classList.remove("is-open");
    if (clean) clean();
    setTimeout(function () { el.remove(); if (cb) cb(); }, 260);
  }
  function mount(el, onKey) {
    close();
    document.body.appendChild(el); openEl = el;
    void el.offsetWidth; el.classList.add("is-open");
    function key(e) { if (e.key === "Escape") close(); else if (onKey) onKey(e); }
    document.addEventListener("keydown", key);
    openCleanup = function () { document.removeEventListener("keydown", key); };
    el.addEventListener("mousedown", function (e) { if (e.target === el) close(); });
    el.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { close(); }); });
  }
  function modal(html) {
    var el = document.createElement("div");
    el.className = "hlw-backdrop"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML = '<div class="hlw-card">' + html + "</div>";
    return el;
  }

  /* ---------- create / delete ---------- */
  function openCreate(done) {
    var el = modal(
      '<div class="hlw-head"><h2 class="hlw-title">Create wish list</h2><button class="hlw-x" type="button" data-close aria-label="Close">' + X + "</button></div>" +
      '<div class="hlw-body"><label class="hlw-label" for="hlwName">Wishlist name</label><input class="hlw-input" id="hlwName" maxlength="40" autocomplete="off" placeholder="Write your wish list title here"></div>' +
      '<div class="hlw-foot"><button class="hlw-cancel" type="button" data-close>Cancel</button><button class="hlw-primary" type="button" id="hlwGo" disabled>Create</button></div>');
    mount(el, function (e) { if (e.key === "Enter" && e.target === input) go(); });
    var input = el.querySelector("#hlwName"), btn = el.querySelector("#hlwGo");
    input.addEventListener("input", function () { btn.disabled = !input.value.trim(); });
    function go() { var v = input.value.trim(); if (!v || !openEl) return; var l = create(v); close(); if (done) done(l); }
    btn.addEventListener("click", go);
    setTimeout(function () { input.focus(); }, 60);
  }
  function openDelete(list, done) {
    if (!list) return;
    var el = modal(
      '<div class="hlw-head"><h2 class="hlw-title">Delete wish list</h2><button class="hlw-x" type="button" data-close aria-label="Close">' + X + "</button></div>" +
      '<div class="hlw-body hlw-body--text">Are you sure to delete “' + esc(list.name) + '” from your wish list?</div>' +
      '<div class="hlw-foot hlw-foot--end"><button class="hlw-cancel" type="button" data-close>Cancel</button><button class="hlw-primary" type="button" id="hlwGo">Delete</button></div>');
    mount(el);
    el.querySelector("#hlwGo").addEventListener("click", function () { removeList(list.id); close(); if (done) done(); });
  }

  /* ---------- share dropdown ---------- */
  function openShare(item, anchor, imgSrc) {
    var url = location.href.split("#")[0];
    var text = (item.place || "Listing") + " — " + (item.addr || "");
    var el = document.createElement("div");
    el.className = "hlw-backdrop hlw-backdrop--clear"; el.setAttribute("role", "dialog");
    el.innerHTML = '<div class="hlw-card hlw-share">' +
      '<div class="hlw-head"><h2 class="hlw-title">Share this livings</h2><button class="hlw-x" type="button" data-close aria-label="Close">' + X + "</button></div>" +
      '<div class="hlw-item"><div class="hlw-item__in"><div class="hlw-item__l"><img class="hlw-item__img" src="' + esc(imgSrc) + '" alt=""><div class="hlw-item__t"><div class="hlw-item__name">' + esc(item.place) + '</div><div class="hlw-item__addr">' + esc(item.addr) + '</div></div></div><div class="hlw-item__price">' + esc(item.price) + "</div></div></div>" +
      '<div class="hlw-opts">' +
        [["copy", "Copy link"], ["email", "Email"], ["message", "Message"], ["whatsapp", "Whatsapp"], ["instagram", "Instagram"], ["facebook", "Facebook"], ["twitter", "Twitter"], ["others", "Others"]]
          .map(function (o) { return '<button class="hlw-opt" type="button" data-s="' + o[0] + '"><img src="' + ICONS[o[0]] + '" alt="">' + o[1] + "</button>"; }).join("") +
      "</div></div>";
    mount(el);
    var card = el.querySelector(".hlw-share");
    var r = anchor.getBoundingClientRect(), w = Math.min(480, window.innerWidth - 32);
    var left = Math.max(16, Math.min(r.right - w, window.innerWidth - w - 16));
    card.style.left = left + "px"; card.style.top = Math.max(16, r.bottom + 10) + "px";
    function onScroll() { close(); }
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    var cleanKeys = openCleanup;
    openCleanup = function () { cleanKeys(); window.removeEventListener("scroll", onScroll); };
    function copy(msg) {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(function () { toast(msg); }, function () { toast(url); });
      else toast(url);
    }
    var enc = encodeURIComponent;
    var acts = {
      copy: function () { copy("Link copied"); },
      email: function () { location.href = "mailto:?subject=" + enc(text) + "&body=" + enc(url); },
      message: function () { location.href = "sms:?&body=" + enc(text + " " + url); },
      whatsapp: function () { window.open("https://wa.me/?text=" + enc(text + " " + url), "_blank", "noopener"); },
      instagram: function () { copy("Link copied — paste it in Instagram"); },
      facebook: function () { window.open("https://www.facebook.com/sharer/sharer.php?u=" + enc(url), "_blank", "noopener"); },
      twitter: function () { window.open("https://twitter.com/intent/tweet?text=" + enc(text) + "&url=" + enc(url), "_blank", "noopener"); },
      others: function () { if (navigator.share) navigator.share({ title: item.place, text: text, url: url }).catch(function () {}); else copy("Link copied"); }
    };
    el.querySelectorAll("[data-s]").forEach(function (b) { b.addEventListener("click", function () { acts[b.getAttribute("data-s")](); close(); }); });
  }


  /* The card picture shrinks to 40x40, then flies into the navbar heart and dissolves */
  function fly(from) {
    var nav = document.getElementById("favBtn");
    if (!nav || !from.animate || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var media = from.closest(".card__media") || from.closest(".detail__top") && document.querySelector("#gallery .gallery__main");
    var img = media && (media.tagName === "IMG" ? media : media.querySelector("img"));
    if (!img) return;
    var r = media.getBoundingClientRect(), n = nav.getBoundingClientRect();
    if (!r.width || !n.width) return;
    var S = 40, cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var el = document.createElement("div");
    el.style.cssText = "position:fixed;z-index:600;pointer-events:none;overflow:hidden;background:#ddd url('" + (img.currentSrc || img.src) + "') center/cover;will-change:transform,opacity;" +
      "left:" + r.left + "px;top:" + r.top + "px;width:" + r.width + "px;height:" + r.height + "px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.18)";
    document.body.appendChild(el);
    var ease = "cubic-bezier(.4,0,.2,1)";
    var a1 = el.animate([
      { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", borderRadius: "12px" },
      { left: (cx - S / 2) + "px", top: (cy - S / 2) + "px", width: S + "px", height: S + "px", borderRadius: "8px" }
    ], { duration: 360, easing: ease, fill: "forwards" });
    a1.onfinish = function () {
      var dx = n.left + n.width / 2 - cx, dy = n.top + n.height / 2 - cy;
      var a2 = el.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(.3)", opacity: 0 }
      ], { duration: 620, easing: "cubic-bezier(.5,0,.75,.4)", fill: "forwards" });
      a2.onfinish = function () {
        el.remove();
        nav.animate([{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }], { duration: 380, easing: ease });
      };
    };
  }

  /* ---------- navbar badge: how many homes are saved (the heart itself only navigates) ---------- */
  function savedCount() {
    var seen = {};
    load().lists.forEach(function (l) { l.items.forEach(function (id) { seen[id] = 1; }); });
    return Object.keys(seen).length;
  }
  function badge() {
    var nav = document.getElementById("favBtn");
    if (!nav) return;
    var host = nav.parentNode;
    if (!host.classList || !host.classList.contains("fav-anchor")) {
      host = document.createElement("span"); host.className = "fav-anchor";
      nav.parentNode.insertBefore(host, nav); host.appendChild(nav);
    }
    var b = host.querySelector(".fav-badge");
    if (!b) { b = document.createElement("span"); b.className = "fav-badge"; b.setAttribute("aria-hidden", "true"); host.appendChild(b); }
    var n = savedCount();
    b.textContent = n > 99 ? "99+" : String(n);
    b.hidden = n === 0;
    nav.setAttribute("aria-label", n ? "Saved homes, " + n + " saved" : "Saved homes");
  }

  /* ---------- hearts ---------- */
  function sync(root) {
    badge();
    (root || document).querySelectorAll("[data-wl-id]").forEach(function (b) {
      var on = isSaved(b.getAttribute("data-wl-id"));
      b.classList.toggle("is-saved", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }
  /* capture phase: our handling replaces the pages' own heart toggles */
  document.addEventListener("click", function (e) {
    var nav = e.target.closest && e.target.closest("#favBtn");
    if (nav) {
      e.preventDefault(); e.stopImmediatePropagation();
      if (!/wishlist(\.html)?$/.test(location.pathname)) location.href = "wishlist.html";
      else window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    var h = e.target.closest && e.target.closest("[data-wl-id]");
    if (h) { e.preventDefault(); e.stopImmediatePropagation(); toggle(h.getAttribute("data-wl-id"), h); }
  }, true);

  document.addEventListener("DOMContentLoaded", function () {
    var nav = document.getElementById("favBtn");
    if (nav && /wishlist(\.html)?$/.test(location.pathname)) nav.classList.add("is-active");
    sync();
  });

  window.HLWishlist = {
    data: load, listing: listingById, isSaved: isSaved, toggle: toggle, create: create, removeList: removeList,
    openCreate: openCreate, openDelete: openDelete, openShare: openShare, sync: sync, visit: visit, toast: toast, esc: esc
  };
})();
