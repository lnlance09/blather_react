import "./css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Grid } from "semantic-ui-react"
import Authentication from "components/authentication/v1/"
import React, { Component } from "react"
import store from "store"

class SignInPage extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		if (
			currentState.user.authenticated &&
			(!currentState.user.verify || currentState.user.emailVerified)
		) {
			this.props.history.push("/")
		}

		this.state = {}
	}

	render() {
		return (
			<Provider store={store}>
				<div className="loginContainer">
					<DisplayMetaTags page="signin" props={this.props} state={this.state} />
					<Container>
						<div className="loginForm">
							<Grid
								textAlign="center"
								verticalAlign="middle"
							>
								<Grid.Column>
									<Authentication />
								</Grid.Column>
							</Grid>
						</div>
					</Container>
				</div>
			</Provider>
		)
	}
}

export default SignInPage
