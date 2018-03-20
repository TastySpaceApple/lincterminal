var regexAction = /##(\d+|EXIT)\s*(\w.+)\r?\n?/g;
var regexInclude = /@@\s*([\w\/\\].+)\r?\n?/g;
module.exports = {
  parse: function(data){
    var result = {actions: {}};
    result.text = data.replace(regexAction, (all, btn, action) =>{
      result.actions[btn] = action;
      return '';
    })
    .replace(regexInclude, (all, fileName) =>{
      if(result.include) result.include.push(fileName)
      else result.include = [fileName];
      return '';
    })
    return result;
  }
}
