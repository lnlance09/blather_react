import "./style.css"
import { Link } from "react-router-dom"
import { Container, List, Segment } from "semantic-ui-react"
import React, { Component } from "react"

class Footer extends Component {
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
							<Link to="/about/privacy">Privacy</Link>
						</List.Item>
						<List.Item>
							<Link to="/about/rules">Rules</Link>
						</List.Item>
					</List>
					<p>© 2018 - 2021, Blather</p>
				</Container>
			</Segment>
		)
	}
}

export default Footer
