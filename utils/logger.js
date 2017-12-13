'use strict'

module.exports = (function (comp) {
  return {
    ctx: comp,
		env_log: process.env.LOG.split(','),
    info: function() {
      if( !this.env_log.includes(this.ctx) ) return {};
      let args = [this.ctx,":"].concat(Array.from(arguments));
			console.log.apply(console, args);
    },

    warn: function() {
      if( !this.env_log.includes(this.ctx) ) return {};
  		let args = [this.ctx,":"].concat(Array.from(arguments));
      console.warn.apply(console, args); 
	  },

    error: function() {
      if( !this.env_log.includes(this.ctx) ) return {};
    	let args = [this.ctx,":"].concat(Array.from(arguments));
			console.error.apply(console, args);
  	}
  }
});
