package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

var (
	myClient = &http.Client{Timeout: 5 * time.Second}
	baseURL  = "https://www.bitstamp.net/api/v2/ticker/"
	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	CurrNames []string

	serverName = "localhost"
	serverPort = 8080
	jsonCh     = make(chan string, 1000)
)

//getJSON - retries single JSON
func getJSON(currName string) (json string, err error) {
	fmt.Printf("connecting for %s\n", currName)
	req, err := http.NewRequest(http.MethodGet, baseURL+currName, nil)
	if err != nil {
		return
	}
	res, err := myClient.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return
	}
	json = string(body)
	if json[:1] != "{" {
		err = fmt.Errorf("response not json:[%s]", json[:30])
	} else {
		json = fmt.Sprintf("{\"currName\":\"%s\",", currName) + json[1:]
	}
	return
}

//CallAPI - goroutine for retrieving API-JSON
func CallAPI(currName string) {
	for {
		if json, err := getJSON(currName); err != nil {
			fmt.Printf("error retrieving [%s]-JSON:[%s]\n", currName, err)
		} else {
			jsonCh <- json
		}
		time.Sleep(1500 * time.Millisecond)
	}
}

//webSocket to publish JSONS
func webSocket(w http.ResponseWriter, r *http.Request) {
	upgrader.CheckOrigin = func(r *http.Request) bool { return true }
	conn, err := upgrader.Upgrade(w, r, nil)
	for {
		if len(CurrNames) < 1 { // first wait to receive the list of keys
			var msg []byte
			_, msg, err = conn.ReadMessage()
			if err != nil {
				fmt.Printf("error reading from websocket:[%s]\n", err)
				return
			}
			CurrNames = strings.Split(string(msg), ",")
			sort.Strings(CurrNames)
			for _, key := range CurrNames {
				go CallAPI(key)
			}
		} else { // once keys received listen for their JSONs
			json := <-jsonCh
			fmt.Printf("publish [%s]\n", json)
			b := []byte(json)
			if err = conn.WriteMessage(websocket.TextMessage, b); err != nil {
				fmt.Printf("error writing on websocket:[%s]\n", err)
				return
			}
		}
	}
}

//main
func main() {
	http.HandleFunc("/crypto", webSocket)
	serverAddress := fmt.Sprintf("%s:%d", serverName, serverPort)
	http.ListenAndServe(serverAddress, nil)
}
