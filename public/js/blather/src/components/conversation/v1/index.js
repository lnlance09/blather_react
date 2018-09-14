import './style.css';
import { fetchConversation, submitConversation } from '../../../pages/actions/fallacy';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { TwitterShareButton } from 'react-share';
import { 
    Button,
    Card,
    Dimmer,
    Form,
    Header,
    Icon,
    Image,
    Message,
    Segment,
    TextArea
} from 'semantic-ui-react';
import { adjustTimezone } from '../../../utils/dateFunctions';
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
            let userLink = `/pages/${props.user.type}/`
            userLink += props.user.type === 'twitter' ? props.user.username : props.user.id
            return (
                <Dimmer.Dimmable 
                    as={Segment} 
                    blurring
                    className='statusActionSegment borderless'
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
        }
        const RenderPosts = props => {
            if(props.conversation) {
                const convoCount = props.conversation.length
                return props.conversation.map((convo, i) => {
                    return (
                        <Card 
                            fluid
                            raised={i === (convoCount-1) ? true : false}
                        >
                            <Card.Content>
                                <Image 
                                    circular 
                                    floated='left' 
                                    size='mini' 
                                    src={convo.img} 
                                />
                                <Card.Header>{convo.name}</Card.Header>
                                <Card.Meta><Moment date={adjustTimezone(convo.date_created)} fromNow interval={60000} /></Card.Meta>
                                <Card.Description>
                                    {convo.message}
                                </Card.Description>
                            </Card.Content>
                        </Card>
                    )
                })
            }
        }
        const InitialStatus = props => {
            if(props.status === 0) {
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
                                    content={props.errorMsg}
                                    error
                                />
                            )}
                            <Button content='Add' floated='right'/>
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
        }

        return (
            <div className='conversation'>
                <Header dividing size='medium'>
                    Conversation
                    {this.props.createdBy && (
                        <Header.Subheader>
                            {this.props.user.name} will attempt to explain to {this.props.createdBy.name} how this logic makes sense
                        </Header.Subheader>
                    )}
                </Header>
                {RenderPosts(this.props)}
                {InitialStatus(this.props)}
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