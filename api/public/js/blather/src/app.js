import "css/app.css"
import "semantic/dist/semantic.min.css"
import React, { Component } from "react"
import SoundFile from "./sound.mp3"
import SoundFileAlt from "./sound.ogg"
import Logo from "./images/icons/icon-100x100.png"
import { Provider } from "react-redux"
import { Route, Router, Switch } from "react-router-dom"
import history from "history.js"
import About from "pages/about"
import Bot from "pages/bot"
import CreateDiscussion from "pages/createDiscussion"
import Discussion from "pages/discussion"
import Discussions from "pages/discussions"
import Fallacy from "pages/fallacy"
import Fallacies from "pages/fallacies"
import NewsFeed from "pages/newsFeed"
import Page from "pages/"
import Post from "pages/post"
import SearchPage from "pages/search"
import Settings from "pages/settings"
import SignIn from "pages/signIn"
import store from "store"
import Tags from "pages/tags"
import Target from "pages/target"
import Users from "pages/users"
import Notification from "./Notification"

class App extends Component {
	constructor(props) {
		super(props)
		this.state = {
			ignore: true,
			title: ""
		}

		// this.sendNotification = this.sendNotification.bind(this)
	}

	handlePermissionGranted() {
		this.setState({ ignore: false })
	}

	handlePermissionDenied() {
		this.setState({ ignore: true })
	}

	handleNotSupported() {
		this.setState({ ignore: true })
	}

	handleNotificationOnClick(e, tag) {
		window.location.href = e.currentTarget.data.url
	}

	handleNotificationOnError(e, tag) {

	}

	handleNotificationOnClose(e, tag) {

	}

	handleNotificationOnShow(e, tag) {
		// this.playSound()
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
		const { ignore, options, title } = this.state
		return (
			<div className="app">
				<Provider store={store}>
					<Router history={history}>
						<Route component={NewsFeed} exact path="/" />

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
								path="/about/:tab(contact|rules)"
								render={props => (
									<About key={window.location.pathname} {...props} />
								)}
							/>
						</Switch>

						<Switch>
							<Route component={CreateDiscussion} exact path="/discussion/create" />
							<Route component={Discussions} exact path="/discussions" />
							<Route component={Discussion} path="/discussions/:id" />
						</Switch>

						<Switch>
							<Route component={Fallacies} exact path="/fallacies" />
							<Route
								exact
								path="/fallacies/:id"
								render={props => {
									const id = props.match.params.id
									if (Number.isInteger(parseInt(id, 10))) {
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
									if (Number.isInteger(parseInt(id, 10))) {
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
							<Route component={SearchPage} exact path="/search" />
							<Route component={SearchPage} path="/search/:type" />
						</Switch>

						<Switch>
							<Route component={Settings} exact path="/settings" />
							<Route component={Settings} path="/settings/:tab" />
						</Switch>

						<Route component={SignIn} path="/signin" />

						<Switch>
							<Route component={Tags} path="/tag/create" />
							<Route component={Tags} path="/tags/:id" />
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
							<Route component={Post} exact path="/video/:id" />
							<Route component={Post} path="/video/:id/:commentId" />
						</Switch>
					</Router>
				</Provider>
				<Notification
					ignore={ignore && title !== ""}
					notSupported={this.handleNotSupported.bind(this)}
					onPermissionGranted={this.handlePermissionGranted.bind(this)}
					onPermissionDenied={this.handlePermissionDenied.bind(this)}
					onShow={this.handleNotificationOnShow.bind(this)}
					onClick={this.handleNotificationOnClick.bind(this)}
					onClose={this.handleNotificationOnClose.bind(this)}
					onError={this.handleNotificationOnError.bind(this)}
					timeout={5000}
					title={title}
					options={options}
				/>
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
