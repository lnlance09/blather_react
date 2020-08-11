import "./style.css"
import { formatNumber, formatPlural, getHighlightedText } from "utils/textFunctions"
import { Item, Label, List } from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Marked from "marked"
import PropTypes from "prop-types"
import React, { Component } from "react"
import sanitizeHtml from "sanitize-html"
import TextTruncate from "react-text-truncate"

class ResultItem extends Component {
	redirectToUrl = e => {
		if (this.props.redirect && !e.metaKey) {
			this.props.history.push(this.props.url)
		} else {
			window.open(this.props.url, "_blank").focus()
		}
	}

	sanitizeHtml(html) {
		let removeBreaks = html === undefined ? html : html.replace(/(\r\n\t|\n|\r\t)/gm, " ")
		const sanitized = sanitizeHtml(removeBreaks, {
			allowedTags: [],
			allowedAttributes: {
				a: ["href"]
			},
			allowedIframeHostnames: ["www.youtube.com"]
		})
		return sanitized
	}

	render() {
		const ItemExtra = props => {
			if (props.extra.length > 1) {
				return (
					<List className="extraList" horizontal>
						{props.extra.map((result, i) => {
							if (parseInt(result.count, 10) > 0) {
								return (
									<List.Item id={props.id} key={`item_extra_${i}`}>
										<b>{formatNumber(result.count)}</b>{" "}
										{formatPlural(result.count, result.term)}
									</List.Item>
								)
							}
							return null
						})}
					</List>
				)
			}

			if (props.extra) {
				return props.extra.count > 0
					? `${formatNumber(props.extra.count)} ${formatPlural(
							props.extra.count,
							props.extra.term
					  )}`
					: null
			}

			return null
		}

		const ItemImage = props => {
			if (props.img) {
				return (
					<Item.Image
						bordered
						centered
						className={
							props.type === "fallacy" || props.type === "fallacies"
								? "fallacyItemImg"
								: null
						}
						label={props.label}
						onError={i => (i.target.src = ImagePic)}
						rounded
						src={props.img}
					/>
				)
			}
			return null
		}

		const ItemContent = props => {
			const validDescription = props.description !== null && props.description !== undefined
			if (props.type === "lazyLoad") {
				return <LazyLoad />
			}

			return (
				<Item.Content>
					<Item.Header>
						{props.highlight && props.title ? (
							<span>
								{getHighlightedText(props.title, props.highlightText, props.id)}
							</span>
						) : (
							<span>{props.title}</span>
						)}
						{props.menu ? props.menu : null}
					</Item.Header>
					{props.meta && <Item.Meta>{props.meta}</Item.Meta>}
					{props.useMarked ? (
						<Item.Description
							dangerouslySetInnerHTML={{
								__html:
									props.description !== undefined && props.description !== null
										? Marked(props.description)
										: null
							}}
						/>
					) : (
						<Item.Description>
							{validDescription && (
								<div>
									{props.truncate ? (
										<TextTruncate
											line={3}
											text={
												props.sanitize
													? this.sanitizeHtml(props.description)
													: props.description
											}
											truncateText="..."
										/>
									) : (
										<div>
											{props.highlight ? (
												<div>
													{getHighlightedText(
														props.description,
														props.highlightText,
														props.id
													)}
												</div>
											) : (
												<div>{props.description}</div>
											)}
										</div>
									)}
								</div>
							)}
						</Item.Description>
					)}
					{props.extra && <Item.Extra>{ItemExtra(props)}</Item.Extra>}
					{props.tags && (
						<Item.Extra>
							<Label.Group>{RenderTags(props.tags)}</Label.Group>
						</Item.Extra>
					)}
				</Item.Content>
			)
		}

		const RenderTags = tags =>
			tags.map((tag, i) => (
				<Label color="red" key={`label_${i}`}>
					{tag}
				</Label>
			))

		return (
			<Item className="resultItem" key={this.props.id} onClick={this.redirectToUrl}>
				{ItemImage(this.props)}
				{ItemContent(this.props)}
			</Item>
		)
	}
}

ResultItem.propTypes = {
	description: PropTypes.string,
	extra: PropTypes.oneOfType([PropTypes.array, PropTypes.bool, PropTypes.object]),
	highlight: PropTypes.bool,
	highlightText: PropTypes.string,
	img: PropTypes.string,
	id: PropTypes.string,
	key: PropTypes.string,
	label: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
	menu: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
	meta: PropTypes.oneOfType([PropTypes.bool, PropTypes.object, PropTypes.string]),
	redirect: PropTypes.bool,
	sanitize: PropTypes.bool,
	tags: PropTypes.array,
	title: PropTypes.string,
	type: PropTypes.string,
	truncate: PropTypes.bool,
	url: PropTypes.string,
	useMarked: PropTypes.bool
}

ResultItem.defaultProps = {
	highlight: false,
	menu: false,
	redirect: true,
	truncate: true,
	useMarked: false
}

export default ResultItem
