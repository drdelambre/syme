export default function generateTopic(topic) {
    const ret = {
        topic: topic,
        path: '',
        regexp: null,
        keys: [],
        subs: []
    };

    ret.path = '^' + topic
        .replace(/\/\(/g, '(?:/')
        .replace(
            /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
            function(_, slash, format, key, capture, optional) {
                ret.keys.push({ name: key, optional: !!optional });

                return '' + (optional ? '' : slash) +
                    '(?:' + (optional ? slash : '') +
                    (format || '') +
                    /* istanbul ignore next */
                    (capture || (format && '([^/.]+?)' || '([^/]+?)')) +
                    ')' + (optional || '');
            }
        )
        .replace(/([\/.])/g, '\\$1')
        .replace(/\*/g, '(.*)') + '$';

    ret.regexp = new RegExp(ret.path);

    return ret;
}
