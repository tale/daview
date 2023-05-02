# daview
> A WebDAV client for the web

This is a very simple implementation of a WebDAV client for the web. It is based on the [webdav](https://npmjs.org/package/webdav) package.
It only supports connecting to a WebDAV backend and viewing the files. Additionally, you may configure auth to allow file downloads.

View a [Live Demo](https://files.tale.me) here.

## Configuration
This project can be run using the `tale.me/library/daview` docker image.
Be sure to forward the appropriate ports for the container based on your configuration.
When running the container, you may use the following environment variables:
```
HOST=0.0.0.0
PORT=3000
PROXY_ENDPOINT="https://my-webdav.acme.com"
PROXY_LOGIN="dav_user:dav_password"
PROXY_USERS="user1:pass1,user2:pass2"
PROXY_SECRET="my_secret_cookie_encryption_value"
```

Please keep in mind that `PROXY_LOGIN` is the credentials for the WebDAV interface that you want to connect to and proxy with **daview**.
`PROXY_USERS` is the usernames and passwords that can be used to authenticate and download on the proxy.

*They do not need to be actual users on your WebDAV instance.*
*All authentication to the WebDAV instance is done through the `PROXY_LOGIN` credentials!*

> Copyright (c) 2023 Aarnav Tale
