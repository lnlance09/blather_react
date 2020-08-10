import { DisplayMetaTags } from "utils/metaFunctions"
import { Container, Header, Image } from "semantic-ui-react"
import DefaultLayout from "layouts"
import React, { Component } from "react"
import TrumpImg from "images/trump-white.png"

class NotFound extends Component {
	render() {
		return (
			<div className="notFoundPage">
				<DisplayMetaTags page="notFound" />

				<DefaultLayout
					activeItem=""
					containerClassName="notFoundPage"
					history={this.props.history}
				>
					<Container textAlign="center">
						<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
						<Header inverted size="large">
							This page does not exist!
						</Header>
					</Container>
				</DefaultLayout>
			</div>
		)
	}
}

export default NotFound
