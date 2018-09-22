import numeral from 'numeral';
import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';
import sanitizeHtml from 'sanitize-html';
momentDurationFormatSetup(moment)

export const convertTimeToSeconds = time => {
    return  moment.duration(time).asSeconds()
}
export const formatDuration = time => {
    if(time < 10) {
        time = `0${time}`
    }
    if(time < 60) {
        return `0:${time}`
    }
    return moment.duration(parseInt(time,10), 'seconds').format('m:ss')
}
export const formatNumber = (count, format = '0a') => numeral(count).format('0a')
export const formatPlural = (count, term) => {
    if(term.substr(term.length-1) === 'y') {
        const word = term.substring(0,term.length-1)
        return parseInt(count,10) === 1 ? term : `${word}ies`
    }
    return parseInt(count,10) === 1 ? term : `${term}s`
}
export const sanitizeText = html => {
    return sanitizeHtml(html, {
        allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol' ],
        allowedAttributes: {
            'a': [ 'href' ]
        },
        allowedIframeHostnames: ['www.youtube.com']
    })
}