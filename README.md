CRYPTO MONITOR
====

Pre requisite for installation
------------

The following is the pre-requisite for `Task1` `Task2` and `Task3`
```shell
 git clone <this repo> cryptoget
 cd !$  
 ```

# Task 1

## Scripting language

`Perl` was valued a good choice. Not only because a `perl` script is usally half the length of a `bash` script, (and so required me half the time to write it) but in my experience `perl` also proved to be more portable than `bash`. The native support for arrays (which likely I use in my data structures) is not supported for instance in bash Mac OSx (default version 3.2- GPL V2) but only since version 4.x (GPL 3).
`Ruby` or `Python` would have then been my second choice.

## Requirements 

- `perl` 
- `go`

## Installation 

(See pre-requisiste)

```shell
- git checkout task1
 ```

## Usage 

```shell
chmod +x *.pl && ./*.pl --pair btcusd
 ```

![perl output](https://github.com/sbasile-ch/cryptoget/blob/master/doc/images/perl.png "perl output")

## Notes 

```shell
./*.pl -h    # should be the self explanatory help   
 ```

# Task 2


I achieved Task 2, with minor code on top of the previous perl script.


## Installation 
(See prerequisiste)

```shell
git checkout task2
 ```

## Usage 

```shell
chmod +x *.pl && ./*.pl --pair btcusd -r 0 
 ```

## Notes 

```shell
./*.pl -h    # should be the self explanatory help   
 ```


# Task 3

## 1st solution (and problem)

I impemented a first `javascript-only` solution. I tried both a standard `XMLHttpRequest` and then an `ES6 fetch`
to retrieve the data from the remote server, but the requests were most of the time `CORS` errors. That was an unexpected surprise, as even if the `browser` was able to access that `URI` (according to the `console.log`), still the data weren't accessible to the `javascript` code. What was even more of a concern, was that the same code was systematically failing in Chrome but failing most of the time in Firefox, (not always). In Firefox for the same `uri` sometimes the data was returned to the `javascript` call, some other times it failed. 
With such unstable calls I had to find another solution.

![CORS error 1](https://github.com/sbasile-ch/cryptoget/blob/master/doc/images/CORS.error.1.png "CORS error 1")
![CORS error 2](https://github.com/sbasile-ch/cryptoget/blob/master/doc/images/CORS.error.2.png "CORS error 2")


## 2nd solution (and problem)
I tried to use the websocket provided directly from the remote server (https://www.bitstamp.net/websocket/). It was a matter of just a few lines of `javascript` code to start receiving `stable` data (once load the `pusher.min.js`). Unfortunately this solution could be used as the `json` formats published don't conatin all the data I needed. 

## 3rd solution (working)
If a curl or even the browser were able to access those `uri` I then decided to implement a local web server to retrieve it and publish on a websocket to my `javascript` code. I chose `go` to implement that webserver as it provides good support for HTTP programming.
Once the server was up and running it started to stream to my `javascript` code which then was able to perform the remaining rendering part.

## Installation 
(See pre-requisiste)

```shell
git checkout task3
go get "github.com/gorilla/websocket"   # import required to stream on the internal websocket
```
## Usage 

```shell
go run *.go   # start the local webserver
 ```
 then open `cryptoget.htm` in the browser.

