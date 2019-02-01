import "./style.css"
import { Link } from "react-router-dom"
import { Follow } from "react-twitter-widgets"
import { Container, List, Segment } from "semantic-ui-react"
import React, { Component } from "react"

class Footer extends Component {
	componentWillMount() {}

	render() {
		return (
			<Segment attached="bottom" className="footerSegment">
				<Container>
					<List className="footerList" horizontal inverted link>
						<List.Item>
							<Link to="/about">About</Link>
						</List.Item>
						<List.Item>
							<Link to="/about/contact">Contact</Link>
						</List.Item>
						<List.Item>
							<Link to="/about/rules">Rules</Link>
						</List.Item>
					</List>
					<p>© 2018 - 2019 Blather</p>
					<Follow className="twitterFollowButton" username="blatherio" />
				</Container>
			</Segment>
		)
	}
}

export default Footer
