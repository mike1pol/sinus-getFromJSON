registerPlugin({
  name: 'Information from JSON',
  version: '1.1',
  description: 'Get information from JSON and set to channel',
  author: 'Mike Pol',
  requiredModules: ['http'],
  vars: [
    {
      name: 'int',
      title: 'Update interval in minutes (default 1 min)',
      type: 'number',
    },
    {
      name: 'url',
      title: 'Server info url',
      type: 'string',
      placeholder: 'insert JSON url like http://host/myjson'
    },
    {
      name: 'data',
      title: 'Data',
      type: 'array',
      vars: [
        {
          name: 'title',
          title: 'Channel title',
          type: 'string',
          placeholder: '[Outcast]:'
        },
        {
          name: 'channel',
          title: 'Channel',
          type: 'channel'
        },
        {
          name: 'path',
          title: 'Path to data in JSON',
          type: 'string',
          placeholder: 'gov.prem.outcast'
        }
      ]
    }
  ]
}, function (sinusbot, config) {
  var int = config.int || 1;
  var url = config.url;
  var data = config.data || [];

  if (data.length === 0 || !url) {
    return null;
  }

  function get(object, path) {
    path = path.split('.');

    var index = 0;
    var length = path.length;

    while (object != null && index < length) {
      object = object[path[index++]];
    }
    return (index && index == length) ? object : undefined;
  }

  var http = require('http');
  var backend = require('backend');
  setInterval(function () {
    http.simpleRequest({
      method: 'GET',
      timeout: 60000,
      url: url
    }, function (err, res) {
      if (err) {
        console.log(err);
        return;
      }
      if (res.statusCode && res.statusCode == 200) {
        var resData = JSON.parse(res.data);
        for (var i = 0; i < data.length; i++) {
          var ch = data[i];
          var cn = get(resData, ch.path) || 0;
          if (ch.channel && backend.getChannelByID(ch.channel)) {
            backend.getChannelByID(ch.channel).setName(ch.title + ' ' + cn.toString());
          }
        }
      }
      console.log('All channels updated');
    });
  }, 60000 * int);
});
