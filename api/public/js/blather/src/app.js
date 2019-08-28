import "css/app.css"
import "semantic/dist/semantic.min.css"
import { Provider } from "react-redux"
import React, { Component } from "react"
import { Route, Router, Switch } from "react-router-dom"
import history from "history.js"
import About from "pages/about"
import Bot from "pages/bot"
import Fallacy from "pages/fallacy"
import Fallacies from "pages/fallacies"
import FallaciesJSON from "fallacies.json"
import Home from "pages/home"
import Logo from "./images/icons/icon-100x100.png"
import NewsFeed from "pages/newsFeed"
import Page from "pages/"
import Post from "pages/post"
import SearchPage from "pages/search"
import Settings from "pages/settings"
import SignIn from "pages/signIn"
import SoundFile from "./sound.mp3"
import SoundFileAlt from "./sound.ogg"
import store from "store"
import Tag from "pages/tag"
import Target from "pages/target"
import Users from "pages/users"

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			ignore: true,
			title: ""
		}

		// this.sendNotification = this.sendNotification.bind(this)
	}

	handleNotificationOnClick(e, tag) {
		window.location.href = e.currentTarget.data.url
	}

	handleNotificationOnClose(e, tag) {

	}

	handleNotificationOnError(e, tag) {

	}

	handleNotificationOnShow(e, tag) {
		// this.playSound()
	}

	handleNotSupported() {
		this.setState({ ignore: true })
	}

	handlePermissionDenied() {
		this.setState({ ignore: true })
	}

	handlePermissionGranted() {
		this.setState({ ignore: false })
	}

	playSound(filename) {
		// document.getElementById("sound").play()
	}

	sendNotification(title, body, url) {
		if (this.state.ignore) {
			return
		}

		const now = Date.now()
		const tag = now
		const options = {
			body,
			data: {
				url
			},
			dir: "ltr",
			icon: Logo,
			lang: "en",
			sound: "./sound.mp3",
			tag
		}
		this.setState({
			options,
			title,
			url
		})
	}

	render() {
		return (
			<div className="app">
				<Provider store={store}>
					<Router history={history}>
						<Route
							exact
							path="/"
							render={props => (
								<NewsFeed key={window.location.pathname} {...props} />
							)}
						/>

						<Route component={NewsFeed} exact path="/activity" />

						<Route
							exact
							path="/assign"
							render={props => (
								<Home key={window.location.pathname} {...props} />
							)}
						/>

						<Route component={Bot} path="/bot" />

						<Switch>
							<Route
								exact
								path="/about"
								render={props => (
									<About key={window.location.pathname} {...props} />
								)}
							/>
							<Route
								path="/about/:tab(contact|privacy|rules)"
								render={props => (
									<About key={window.location.pathname} {...props} />
								)}
							/>
						</Switch>

						<Switch>
							<Route
								path="/comment/:id"
								render={props => <Post sendNotification={(title, body, url) => this.sendNotification(title, body, url)} {...props} />}
							/>
						</Switch>

						<Switch>
							<Route component={Fallacies} exact path="/fallacies" />
							<Route
								exact
								path="/fallacies/:id"
								render={props => {
									const id = props.match.params.id
									const idSlug = id.split("-").join(" ")
									const inArray = FallaciesJSON.filter(f => f.name.toLowerCase() === idSlug)
									if (inArray.length === 0) {
										return <Fallacy {...props} />
									}
									return <Fallacies {...props} />
								}}
							/>
							<Route
								exact
								path="/fallacies/:id/:tab"
								render={props => {
									const id = props.match.params.id
									const idSlug = id.split("-").join(" ")
									const inArray = FallaciesJSON.filter(f => f.name.toLowerCase() === idSlug)
									if (inArray.length === 0) {
										return <Fallacy {...props} />
									}
									return <Fallacies {...props} />
								}}
							/>
						</Switch>

						<Switch>
							<Route
								exact
								path="/pages/:network/:id"
								render={props => <Page {...props} />}
							/>
							<Route
								path="/pages/:network/:id/:tab/:fallacyId"
								render={props => <Page {...props} />}
							/>
							<Route
								path="/pages/:network/:id/:tab"
								render={props => <Page {...props} />}
							/>
						</Switch>

						<Switch>
							<Route exact path="/search" render={props => <SearchPage {...props} />} />
							<Route path="/search/:type" render={props => <SearchPage {...props} />} />
						</Switch>

						<Switch>
							<Route component={Settings} exact path="/settings" />
							<Route component={Settings} path="/settings/:tab" />
						</Switch>

						<Route component={SignIn} path="/signin" />

						<Switch>
							<Route component={Tag} exact path="/tags/create" />
							<Route component={Tag} path="/tags/:id" />
						</Switch>

						<Switch>
							<Route
								path="/tweet/:id"
								render={props => <Post sendNotification={(title, body, url) => this.sendNotification(title, body, url)} {...props} />}
							/>
						</Switch>

						<Switch>
							<Route component={Target} exact path="/targets/:userId/:pageId" />
							<Route component={Target} exact path="/targets/create/:pageId" />
						</Switch>

						<Switch>
							<Route
								exact
								path="/users/:username"
								render={props => {
									return <Users {...props} />
								}}
							/>
							<Route
								path="/users/:username/:tab"
								render={props => {
									return <Users {...props} />
								}}
							/>
						</Switch>

						<Switch>
							<Route
								exact
								path="/video/:id"
								render={props => <Post sendNotification={(title, body, url) => this.sendNotification(title, body, url)} {...props} />}
							/>
						</Switch>
					</Router>
				</Provider>

				<audio id="sound" preload="auto">
					<source src={SoundFile} type="audio/mpeg" />
					<source src={SoundFileAlt} type="audio/ogg" />
					<embed autostart="false" hidden loop={false} src={SoundFile} />
				</audio>
			</div>
		)
	}
}

export default App
