import "css/app.css"
import "semantic/dist/semantic.min.css"
import React, { Component } from "react"
import { Provider } from "react-redux"
import { Route, Router, Switch } from "react-router-dom"
import history from "history.js"
import About from "pages/about"
import CreateDiscussion from "pages/createDiscussion"
import Discussion from "pages/discussion"
import Discussions from "pages/discussions"
import Fallacy from "pages/fallacy"
import Fallacies from "pages/fallacies"
import Page from "pages/"
import Post from "pages/post"
import SearchPage from "pages/search"
import Settings from "pages/settings"
import SignIn from "pages/signIn"
import store from "store"
import Tags from "pages/tags"
import Target from "pages/target"
import Users from "pages/users"

class App extends Component {
	render() {
		return (
			<div className="app">
				<Provider store={store}>
					<Router history={history}>
						<Route component={Fallacies} exact path="/" />

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
						</Switch>

						<Switch>
							<Route
								exact
								path="/pages/:network/:id"
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
							<Route component={Post} path="/tweet/:id" />
						</Switch>

						<Switch>
							<Route component={Target} exact path="/targets/:userId/:pageId" />
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
			</div>
		)
	}
}

export default App
