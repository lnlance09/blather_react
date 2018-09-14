import React from 'react';
import MetaTags from 'react-meta-tags';

export const capitalizeWord = word => word.slice(0,1).toUpperCase()+word.slice(1)

export const DisplayMetaTags = ({page, props, state}) => {
    const description = 'Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media'
    const img = ''
    let metaTags = {}
    switch(page) {
        case'about':
            metaTags = {
                description: description,
                img,
                title: capitalizeWord(state.activeItem)
            }
            break
        case'createDiscussion':
            metaTags = {
                description: 'Start a discussion where everyone plays by the same set of rules and intellectually dishonest debate tactics are called out. Change your mind if the evidence is compelling.',
                img,
                title: 'Change my mind'
            }
            break
        case'discussion':
            metaTags = {
                description: '',
                img,
                title: props.title
            }
            break
        case'discussions':
            metaTags = {
                description: '',
                img,
                title: 'Discussions'
            }
            break
        case'fallacies':
            metaTags = {
                description: '',
                img,
                title: 'Fallacies'
            }
            break
        case'fallacy':
            metaTags = {
                description: '',
                img,
                title: props.title
            }
            break
        case'pages':
            if(props.error) {
                metaTags = {
                    description: '',
                    img,
                    title: 'Not found'
                }
            } else {
                metaTags = {
                    description: `${props.name}'s profile on Blather`,
                    img,
                    title: props.name
                }
            }
            break
        case'post':
            if(props.info) {
                let title = ''
                if(props.type === 'video') {
                    title = props.info.title
                } else {
                    title = `Tweet by ${props.info.user.name}`
                }
                metaTags = {
                    description: `Does the logic in this ${props.type} make sense? Call out fallacious reasoning and ask this creator of this content to explain his or her self.`,
                    img,
                    title: title
                }
            } else {
                metaTags = {
                    description: 'This post does not exist',
                    img,
                    title: 'Not found'
                }
            }
            break
        case'search':
            metaTags = {
                description: '',
                img,
                title: `Search results for '${state.value}'`
            }
            break
        case'settings':
            metaTags = {
                description: '',
                img,
                title: `Settings`
            }
            break
        case'signin':
            metaTags = {
                description: '',
                img,
                title: 'Sign in'
            }
            break
        case'users':
            metaTags = {
                description: `${props.user.name}'s discussions, fallacies and archived links on Blather`,
                img,
                title: props.user.name
            }
            break
        default:
            metaTags = {
                description: description,
                img,
                title: ''
            }
            break
    }

    return (
        <MetaTags>
            <title>{metaTags.title} - Blather</title>
            <meta name='description' content={metaTags.description} />
            <meta property='og:image' content={metaTags.img} />
            <meta property='og:site_name' content='Blather' />
            <meta property='og:title' content={metaTags.title} />
            <meta property='og:type' content='website' />
            <meta property='og:url' content={`${window.location.origin}${props.location.pathname}`} />
        </MetaTags>
    )
}