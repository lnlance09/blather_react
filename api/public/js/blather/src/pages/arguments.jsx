import { DisplayMetaTags } from "utils/metaFunctions"
import { Provider } from "react-redux"
import { Container, Divider, Header, Message, Segment } from "semantic-ui-react"
import Arguments from "components/primary/arguments/v1/"
import DefaultLayout from "layouts"
import React, { Component } from "react"
import store from "store"

class ArgumentsPage extends Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<Provider store={store}>
                <div className="argumentsPage">
					<DisplayMetaTags page="arguments" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem="arguments"
						containerClassName="argumentsPage"
						history={this.props.history}
					>
						<Header inverted size="huge">
							Arguments (sort of)
						</Header>
						<Message as={Segment} className="argumentsMsg" inverted size="large">
							<Message.Content>
								These are some of the most ubiquitous right-wing talking points.
								These aren't particularly good arguments but they're certainly some of the most common.
								Plenty of people have crafted personal brands and built entire careers as pundits by doing nothing more than repeating a handful of these tired talking points.
							</Message.Content>
							<Divider hidden />
							<Message.Header>
								Some things to consider
							</Message.Header>
							<Message.List>
								<Message.Item>All of these can be refuted with minimal thought</Message.Item>
								<Message.Item>There aren't any overarching principles that link these arguments together</Message.Item>
								<Message.Item>Many of these arguments contradict eachother in very obvious ways</Message.Item>
								<Message.Item>Conservatism isn't a philosophy or even a coherent set of ideas - it's just blind, confused rage that people try to justify after the fact with meaningless platitudes and cheap gotcha moments</Message.Item>
								<Message.Item>These aren't really "arguments" per se, they're just whatever has to be said at a moment's notice in order to own the libs - even if that means owning yourself</Message.Item>
							</Message.List>
						</Message>

						<Arguments argument={this.props.match.params.argument} />
					</DefaultLayout>
				</div>
			</Provider>
		)
	}
}

export default ArgumentsPage
