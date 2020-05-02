import { DisplayMetaTags } from "utils/metaFunctions"
import { Container, Header, Image } from "semantic-ui-react"
import PageFooter from "components/primary/footer/v1/"
import PageHeader from "components/secondary/header/v1/"
import React, { Component } from "react"
import TrumpImg from "images/trump-white.png"

class NotFound extends Component {
	render() {
		return (
			<div className="404Page">
				<DisplayMetaTags page="notFound" props={this.props} state={this.state} />
				<PageHeader {...this.props} />
				<Container className="mainContainer" textAlign="center">
					<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
					<Header size="large">This page does not exist!</Header>
				</Container>
				<PageFooter />
			</div>
		)
	}
}

export default NotFound
