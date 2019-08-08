import "./style.css"
import { Link } from "react-router-dom"
import { Container, List, Segment } from "semantic-ui-react"
import React, { Component } from "react"

class Footer extends Component {
	componentDidMount() {
		const aScript = document.createElement("script")
		aScript.type = "text/javascript"
		aScript.src = "https://c6.patreon.com/becomePatronButton.bundle.js"
		document.head.appendChild(aScript)
	}

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
					<p>© 2018 - 2019, Blather</p>
					<p>
						<a
							href="https://www.patreon.com/bePatron?u=3485613"
							data-patreon-widget-type="become-patron-button"
						>
							Become a Patron!
						</a>
					</p>
				</Container>
			</Segment>
		)
	}
}

export default Footer
