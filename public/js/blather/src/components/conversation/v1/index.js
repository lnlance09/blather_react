import './style.css';
import { fetchConversation, submitConversation } from '../../../pages/actions/fallacy';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { TwitterShareButton } from 'react-share';
import { 
    Button,
    Card,
    Dimmer,
    Divider,
    Form,
    Header,
    Icon,
    Image,
    Message,
    Segment,
    TextArea
} from 'semantic-ui-react';
import { adjustTimezone } from '../../../utils/dateFunctions';
import Marked from 'marked';
import Moment from 'react-moment';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Conversation extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            message: ''
        }

        if(this.props.fallacyId) {
            this.props.fetchConversation({
                bearer: this.props.bearer,
                id: this.props.fallacyId
            })
        }

        Marked.setOptions({
            renderer: new Marked.Renderer(),
            highlight: function(code) {
                // return require('highlight.js').highlightAuto(code).value;
            },
            pedantic: false,
            breaks: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            xhtml: false
        })

        this.onChangeMessage = this.onChangeMessage.bind(this)
        this.submitForm = this.submitForm.bind(this)
    }

    onChangeMessage = (e, { value }) => this.setState({ message: value })

    submitForm() {
        this.setState({ message: '' })
        this.props.submitConversation({
            bearer: this.props.bearer,
            id: this.props.fallacyId,
            msg: this.state.message
        })
    }

    render() {
        const { message } = this.state
        const CallOutUser = props => {
            if(props.user.type === 'twitter') {
                return (
                    <div>
                        <TwitterShareButton 
                            className='twitterButton ui icon button'
                            title={`${props.title}`}
                            url={`${window.location.origin}/fallacies/${props.fallacyId}`}
                        >
                            <Icon name='twitter' /> Tweet @{props.user.username}
                        </TwitterShareButton>
                    </div>
                )
            }

            if(props.user.type === 'youtube') {
                return (
                    <Button 
                        className='youtubeButton' 
                        icon 
                        onClick={() => window.open(`https://youtube.com/channel/${props.user.id}`, '_blank')}
                        style={{ marginTop: '12px' }}
                    >
                        <Icon name='youtube' /> Contact {props.user.name}
                    </Button>
                )
            }
        }
        const ContactUser = props => {
            switch(props.status) {
                case 0:
                    const userLink = `/pages/${props.user.type}/${props.user.type === 'twitter' ? props.user.username : props.user.id}`
                    return (
                        <Dimmer.Dimmable 
                            as={Segment} 
                            blurring
                            className='statusActionSegment'
                            dimmed
                        >
                            <Dimmer active inverted>
                                {props.user && (
                                    <div>
                                        <Header size='small'>
                                            Waiting for <Link to={userLink}>{props.user.name}</Link> to offer an explanation...
                                        </Header>
                                        {CallOutUser(props)}
                                    </div>
                                )}
                            </Dimmer>
                        </Dimmer.Dimmable>
                    )
                case 1:
                    return (
                        <p>Waiting on {props.user.name}</p>
                    )
                default:
                    return null
            }
        }
        const ConvoCard = convo => (
            <Card fluid>
                <Card.Content>
                    <Image 
                        circular 
                        floated='left' 
                        size='mini' 
                        src={convo.img} 
                    />
                    <Card.Header>{convo.name}</Card.Header>
                    <Card.Meta><Moment date={adjustTimezone(convo.date_created)} fromNow interval={60000} /></Card.Meta>
                    <Card.Description
                        dangerouslySetInnerHTML={{__html: Marked(convo.message)}}
                    >
                    </Card.Description>
                </Card.Content>
            </Card>
        )
        const RenderPosts = props => {
            if(props.conversation) {
                const convos = []
                const count = props.conversation.length
                for(let i = 0; i < count; i+=2) {
                    let round = i === 0 ? 1 : (i/2)+1
                    convos.push(
                        <div>
                            <Divider horizontal>Round {round}</Divider>
                            <div>
                                {ConvoCard(props.conversation[i])}
                                {i+1 <= parseInt(count-1,10) ? ConvoCard(props.conversation[i+1]) : null}
                            </div>
                        </div>
                    )
                }
                return convos
            }
        }
        const InitialStatus = props => {
            if(props.canRespond) {
                return (
                    <Form
                        error={props.error}
                        onSubmit={this.submitForm}
                    >
                        <TextArea 
                            className='convoTextArea' 
                            onChange={this.onChangeMessage}
                            placeholder={`Tell ${props.createdBy.name} why this is not a fallacy`} 
                            rows={10} 
                            value={message}
                        />
                        {props.error && (
                            <Message 
                                className='convoErrorMsg'
                                content={props.errorMsg}
                                error
                            />
                        )}
                        <Button className='convoRespondBtn' floated='right'>
                            <Icon name='pencil' />
                            Respond
                        </Button>
                        <div className='clearfix'></div>
                    </Form>
                )
            } else {
                return (
                    <div>
                        {ContactUser(props)}
                    </div>
                )
            }
        }

        return (
            <div className='conversation'>
                <Header dividing size='medium'>
                    Conversation
                    {this.props.createdBy && (
                        <Header.Subheader>
                            {this.props.user.name} will explain his reasoning
                        </Header.Subheader>
                    )}
                </Header>
                {RenderPosts(this.props)}
                <div className='convoResponseSection'>
                    {InitialStatus(this.props)}
                </div>
            </div>
        )
    }
}

Conversation.propTypes = {
    authenticated: PropTypes.bool,
    canRespond: PropTypes.bool,
    conversation: PropTypes.array,
    createdBy: PropTypes.shape({
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }),
    error: PropTypes.bool,
    errorMsg: PropTypes.string,
    fallacyId: PropTypes.number,
    fetchConversation: PropTypes.func,
    status: PropTypes.number,
    submitConversation: PropTypes.func,
    submitted: PropTypes.bool,
    user: PropTypes.object
}

Conversation.defaultProps = {
    error: false,
    fetchConversation: fetchConversation,
    submitConversation: submitConversation,
    submitted: false
}


const mapStateToProps = (state, ownProps) => ({
    ...state.fallacy,
    ...ownProps
})

export default connect(mapStateToProps, { fetchConversation, submitConversation })(Conversation);