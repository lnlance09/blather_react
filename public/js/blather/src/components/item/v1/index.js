import './style.css';
import { formatNumber, formatPlural } from '../../../utils/textFunctions';
import { 
    Image,
    Item,
    Label,
    List
} from 'semantic-ui-react';
import ImagePic from '../../../images/image-square.png';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import sanitizeHtml from 'sanitize-html';
import TextTruncate from 'react-text-truncate';

class ResultItem extends Component {
    componentWillMount() {
        
    }

    redirectToUrl = () => {
        if(this.props.redirect) {
            this.props.history.push(this.props.url)
        } else {
            window.open(this.props.url, '_blank').focus()
        }
    }

    sanitizeHtml(html) {
        let removeBreaks = html === undefined ? html : html.replace(/(\r\n\t|\n|\r\t)/gm, " ")
        const sanitized = sanitizeHtml(removeBreaks, {
            allowedTags: [ ],
            allowedAttributes: {
                'a': [ 'href' ]
            },
            allowedIframeHostnames: ['www.youtube.com']
        })
        return sanitized
    }

    render() {
        const ItemExtra = props => {
            if(props.extra.length > 1) {
                return (
                    <List className='extraList' horizontal>
                        {props.extra.map((result, i) => {
                            if(parseInt(result.count,10) > 0) {
                                return (
                                    <List.Item key={`${props.key}_${i}`}>
                                        <b>{formatNumber(result.count)}</b> {formatPlural(result.count, result.term)}
                                    </List.Item>
                                )
                            }
                        })}
                    </List>
                )
            }

            if(props.extra) {
                return props.extra.count > 0 ? `${formatNumber(props.extra.count)} ${formatPlural(props.extra.count, props.extra.term)}` : null
            }

            return null
        }
        const ItemImage = props => {
            if(props.img) {
                return (<Item.Image onError={i => i.target.src = ImagePic} size='small' src={props.img} />)
            }
            return null
        }
        const ItemContent = props => {
            if(props.type === 'lazyLoad') {
                return (
                    <Item.Content>
                        <Image fluid src={ParagraphPic} />
                    </Item.Content>
                )
            }

            return (
                <Item.Content>
                    <Item.Header>{props.title}</Item.Header>
                    {props.meta && (
                        <Item.Meta>{props.meta}</Item.Meta>
                    )}
                    <Item.Description>
                        <TextTruncate
                            line={3}
                            truncateText='...'
                            text={props.sanitize && props.description !== null ? this.sanitizeHtml(props.description) : props.description}
                        />
                    </Item.Description>
                    {props.extra && (
                        <Item.Extra>
                            {ItemExtra(this.props)}
                        </Item.Extra>
                    )}
                    {props.tags && (
                        <Item.Extra>
                            {RenderTags(this.props.tags)}
                        </Item.Extra>
                    )}
                </Item.Content>
            )
        }
        const RenderTags = tags => tags.map((tag, i) => (
            <Label horizontal key={`${this.props.key}_label_${i}`}>
                {tag}
            </Label>
        ))

        return (
            <Item 
                className='resultItem'
                key={this.props.id}
                onClick={this.redirectToUrl}
                style={{ cursor: 'pointer' }}
            >
                {ItemImage(this.props)}
                {ItemContent(this.props)}
            </Item>
        )
    }
}

ResultItem.propTypes = {
    description: PropTypes.string,
    extra: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.bool,
        PropTypes.object
    ]),
    img: PropTypes.string,
    id: PropTypes.string,
    key: PropTypes.string,
    meta: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.object,
        PropTypes.string
    ]),
    redirect: PropTypes.bool,
    sanitize: PropTypes.bool,
    tags: PropTypes.array,
    title: PropTypes.string,
    type: PropTypes.string,
    url: PropTypes.string
}

ResultItem.defaultProps = {
    redirect: true
}

export default ResultItem