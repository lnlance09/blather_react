import './style.css';
import { } from './actions';
import { connect } from 'react-redux';
import { 
    Button,
    Divider,
    Dropdown,
    Form,
    Header,
    Icon,
    Image,
    Segment,
    TextArea
} from 'semantic-ui-react';
import { dateDifference } from '../../../utils/dateFunctions';
import { fallacyDropdownOptions } from '../../../utils/fallacyFunctions';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Tweet from '../../tweet/v1/';
import YouTubeVideo from '../../youTubeVideo/v1/';

class FallacyExample extends Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            explanation: props.explanation,
            fallacyId: props.fallacyId,
            fallacyName: props.fallacyName,
            loading: false
        }

        this.onChangeExplanation = this.onChangeExplanation.bind(this)
        this.onChangeFallacy = this.onChangeFallacy.bind(this)
        this.onClickEdit = this.onClickEdit.bind(this)
        this.updateFallacy = this.updateFallacy.bind(this)
    }

    componentWillMount() {
        
    }

    onChangeExplanation = (e, { value }) => this.setState({ explanation: value })

    onChangeFallacy = (e, { value }) => {
        this.setState({ 
            fallacyId: parseInt(value, 10),
            fallacyName: e.target.textContent
        })
    }

    onClickEdit = () => {
        this.setState({ 
            editing: this.state.editing ? false : true,
            explanation: this.props.explanation
        })
    }

    updateFallacy(e) {
        e.preventDefault()
        this.setState({ editing: false, loading: true })
        this.props.updateFallacy({
            bearer: this.props.bearer,
            id: this.props.id,
            explanation: this.state.explanation,
            fallacyId: this.state.fallacyId,
            fallacyName: this.state.fallacyName,
        })
    }

    render() {
        const { editing, explanation, fallacyId, fallacyName } = this.state
        const EditButton = ({props}) => {
            if(props.explanation) {
                if(props.canEdit) {
                    if(editing) {
                        return (<Icon className='editButton editing' name='close' onClick={this.onClickEdit} />)
                    }
                    return (<Icon className='editButton' name='pencil' onClick={this.onClickEdit} />)
                }
            }
            return null
        }
        const Explanation = props => (
            <div className='fallacyExplanation' style={{ marginTop: '15px' }}>
                <Header as='h2' size='medium'>
                    {props.fallacyName}
                    <EditButton props={props} />
                </Header>
                {props.explanation && (
                    <div>
                        {editing && (
                            <Form onSubmit={this.updateFallacy}>
                                <Form.Field>
                                    <Dropdown 
                                        className='fallacyDropdown'
                                        defaultValue={''+ props.fallacyId +''}
                                        onChange={this.onChangeFallacy}
                                        options={fallacyDropdownOptions}
                                        placeholder='Select a fallacy'
                                        search 
                                        selection
                                    />
                                </Form.Field>
                                <Form.Field>
                                    <TextArea 
                                        onChange={this.onChangeExplanation}
                                        placeholder='Why is this a fallacy?'
                                        rows={10}
                                        value={explanation}
                                    />
                                </Form.Field>
                                <Button 
                                    className='updateBtn'
                                    compact
                                    content='Update' 
                                    fluid 
                                    type='submit' 
                                />
                            </Form>
                        )}
                        {!editing && (
                            <p>
                                {props.explanation}
                            </p>
                        )}
                    </div>
                )}
                {!props.explanation && (
                    <Segment className='lazyLoadSegment'>
                        <Image fluid src={ParagraphPic} />
                    </Segment>
                )}
            </div>
        )
        const Material = props => (
            <div className='fallacyMaterial'>
                <Header as='h3' size='medium'>
                    Material
                </Header>
                {props.user && (
                    <div>
                        {ParseMaterial(props)}
                        {ShowDateDifference(props)}
                        {this.props.contradiction && (
                            <div>
                                {ParseMaterial(props, true)}
                            </div>
                        )}
                    </div>
                )}
                {!this.props.user && (
                    <Segment className='lazyLoadSegment'>
                        <Image fluid src={ParagraphPic} />
                    </Segment>
                )}
            </div>
        )
        const ParseMaterial = (props, contradiction = false) => {
            let material = props
            if(contradiction) {
                material = props.contradiction
            }

            if(material.tweet) {
                return (
                    <Tweet 
                        archive={material.tweet.archive}
                        bearer={props.bearer}
                        canArchive
                        created_at={material.tweet.created_at}
                        extended_entities={material.tweet.extended_entities}
                        full_text={material.tweet.full_text}
                        id={material.tweet.id_str}
                        is_quote_status={material.tweet.is_quote_status}
                        quoted_status={
                            material.tweet.quoted_status === undefined && material.tweet.is_quote_status ? 
                            material.tweet.retweeted_status : 
                            material.tweet.quoted_status
                        }
                        quoted_status_id_str={material.tweet.quoted_status_id_str}
                        quoted_status_permalink={material.tweet.quoted_status_permalink}
                        retweeted_status={material.tweet.retweeted_status === undefined ? false : material.tweet.retweeted_status}
                        stats={{
                            favorite_count: material.tweet.favorite_count,
                            retweet_count: material.tweet.retweet_count
                        }}
                        user={material.tweet.user}
                    />
                )
            }

            if(material.video) {
                return (
                    <YouTubeVideo 
                        channel={material.video.channel}
                        comment={material.video.comment}
                        dateCreated={material.video.dateCreated}
                        description={material.video.description}
                        history={props.history}
                        id={material.video.id}
                        showChannel={false}
                        showStats={false}
                        startTime={material.video.startTime}
                        stats={material.video.stats}
                        title={material.video.title}
                    />
                )
            }
            return null
        }
        const ShowDateDifference = props => {
            if(props.contradiction) {
                let dateOne = ''
                let dateTwo = ''
                if(props.tweet) {
                    dateOne = props.tweet.created_at
                }
                if(props.video) {
                    dateOne = props.video.dateCreated
                    if(props.video.comment.id) {
                        dateOne = props.video.comment.dateCreated
                    }
                }

                if(props.contradiction.tweet) {
                    dateTwo = props.contradiction.tweet.created_at
                }
                if(props.contradiction.video) {
                    dateTwo = props.contradiction.video.dateCreated
                    if(props.contradiction.video.comment) {
                        dateTwo = props.contradiction.video.comment.dateCreated
                    }
                }
                return (<Divider horizontal>{dateDifference(dateOne, dateTwo)}</Divider>)
            }
            return null
        }

        console.log('pppp')
        console.log(this.props)
        return (
            <div className='fallacyExample'>
                {this.props.showExplanation && (
                    <div>
                        {Explanation(this.props)}
                    </div>
                )}
                {Material(this.props)}
            </div>
        )
    }
}

FallacyExample.propTypes = {
    bearer: PropTypes.string,
    canEdit: PropTypes.bool,
    showExplanation: PropTypes.bool
}

FallacyExample.defaultProps = {
    canEdit: false,
    showExplanation: true
}

const mapStateToProps = (state, ownProps) => ({
    ...state.fallacy,
    ...ownProps
})

export default connect(mapStateToProps, { })(FallacyExample);