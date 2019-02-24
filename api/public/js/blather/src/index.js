import App from "app"
import React from "react"
import ReactDOM from "react-dom"
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<App />, document.getElementById("root"))
serviceWorker.unregister()
