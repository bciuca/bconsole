# bconsole - simple websocket logging

## Overview
The bconsole utility is a Node.js based web socket server that logs messages from a client application. Included in this repo is the Node.js module and the client side library.

## Usage

### Client Side

Running the logger in the console is a matter of loading the bconsole and the socket.io js files. To use the bconsole in your client application, load the libraries and initialze bconsole with at least the URL of the server component. The default configuration use port 7076.
```html
<script src="js/bconsole.client.js"></script>

<script>
    // Initialize the console instance.
    // Either load the socket.io library dynamically as done in the
    //   the configuration below, or load the library via script tag.
    // The serverUrl is the path to your node socket server instance
    //   and port number.
    bconsole.init({
	    libPath: 'js/socket.io.js',
	    serverUrl: 'http://127.0.0.1:7076'
    });

    bconsole.log('Hello world!');
</script>
```

### Server Side

Set configuration for the server in the config file, `config/config.json`

```json
{
    "logPath": "../logs/",
    "logFileNamePrefix": "log",
    "port": 7076,
    "verbose": true
}
```

Start the server in the terminal:

    node bconsole.server.js


## Example

The sample web app can be found in `sample/index.html`. 

