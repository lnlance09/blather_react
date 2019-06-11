import "pages/css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Grid } from "semantic-ui-react"
import Authentication from "components/authentication/v1/"
import Logo from "components/header/v1/images/logo.svg"
import queryString from "query-string"
import React, { Component } from "react"
import ReactSVG from "react-svg"
import store from "store"

class SignInPage extends Component {
	constructor(props) {
		super(props)
		const qs = queryString.parse(this.props.location.search)
		const currentState = store.getState()
		if (
			currentState.user.authenticated &&
			(!currentState.user.verify || currentState.user.emailVerified)
		) {
			this.props.history.push("/")
		}

		this.state = {
			type: qs.type
		}
	}

	render() {
		const { type } = this.state

		return (
			<Provider store={store}>
				<div className="loginContainer">
					<DisplayMetaTags page="signin" props={this.props} state={this.state} />
					<Container className="signInPageHeader" textAlign="center">
						<ReactSVG
							className="mainLogo"
							evalScripts="always"
							onClick={() => {
								this.props.history.push("/")
							}}
							src={Logo}
							svgClassName="svgMainLogo"
						/>
					</Container>
					<Container textAlign="center">
						<div className="loginForm">
							<Grid textAlign="center" verticalAlign="middle">
								<Grid.Column>
									<Authentication type={type} />
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
