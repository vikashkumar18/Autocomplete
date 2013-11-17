
var Items = (function($,_,Backbone){
	escape = function(s) {
	  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	};
	var Item = Backbone.Model.extend({
		match:function(){
			
			return this.regex.test(this.get(this.key));
		},
		selected:false
	});

	var ItemCollection = Backbone.Collection.extend({
		initializer: function(key){
			
			Item.prototype.key= key;
			
		},
		createRegex:function(value){
			Item.prototype.regex = new RegExp(escape(value),'i');
		
		},
		
		model:Item
	});
	return ItemCollection;
})($,_,Backbone)

var AutoCompleteView=(function($,_,Backbone){

 var SelectedListView = Backbone.View.extend({
 	tagName:'span',
 	className:'autocomplete-selectedList',
 	events:{
 		'click .autocomplete-sel-close':'removeView'
 	},
 	render:function(){
 		this.$el.html("<a class='autocomplete-selItem'><span class='autocomplete-selSpan'>"+this.model.get(this.model.key)+"</span><span class='autocomplete-sel-close glyphicon glyphicon-remove-circle'></span></a>");
 		this.delegateEvents();
 		return this;
 	},
 	removeView:function(){
 		this.model.selected=false;
 		this.remove();

 	}
 });


 var ItemView=Backbone.View.extend({
 		tagName:'li',
 		className:'autocomplete-list',
 		events:{
 			"mouseover":"highlight",
 			"mouseout":"removeHover",
 			"click":"selected"
 		},
 		isHighlighted:false,
 		highlight:function(){
 			this.$el.addClass("highlight");
 			this.isHighlighted=true;
 		},
 		removeHover:function(){
 			this.$el.removeClass("highlight");
 			this.isHighlighted=false;
 		},
 		selected:function(){
 			this.model.selected=true;
 			var selectedListView = new SelectedListView({model:this.model});
 			$("#result").append(selectedListView.render().el);

 		},
 		render:function(){
 			
 			this.$el.html(this.model.get(this.model.key));
 			
 			return this;
 		}
 });





var AutocompleteView = Backbone.View.extend({
	el:".container",
	initialize:function(){

		this.collection.initializer('key');
		this.collection.comparator=function(a,b){
			
			if(a.get(a.key)<b.get(b.key)){

				return -1;
			}else if(a.get(a.key)==b.get(b.key)){
				return 0;
			}else{
				return 1;
			}

		};
		
		this.collection.sort();
		this.resultList = this.$(".autocomplete");
		this.inputBox = this.$("input[type=text]");
		
	},
	events:{
		'keyup input[type=text]':'showResults',
		'click ul':'showResults',
		'keydown':'keyboardEvents',
		//'mousedup ul li':'clearResult',
		//'focusout':'clearResult',
		'focusin input[type=text]':'showResults'
	},
	render:function(){
		
	},
	showResults:function(e){                 //keyDown fires keyboardEvents first before keyup fires showResult
											//so when enter key is pressed keyboardEvents fired before showResult
		if(e.keyCode!=38 && e.keyCode!=40 ){
		this.clearResult();
		this.resultArray=[];
		this.counter=-1;

		var x = this.inputBox.val();
		
		if(x){
		this.collection.createRegex(x);

		_.forEach(this.collection.models,function(model){
			
			if(!model.selected && model.match()){
				
				var itemView = new ItemView({model:model});

				this.resultList.append(itemView.render().el);
				this.resultArray.push(itemView);
				//console.log("dswwwww"+itemView.render().$el.html());
			}
		},this);}}
		
	},
	keyboardEvents:function(e){
		console.log(this.resultArray);
		var arrayLength = this.resultArray && this.resultArray.length;
		console.log(e.keyCode);
		if(e.keyCode==38 && arrayLength>0 && this.counter>-1){
			this.counter = this.counter>0?this.counter-1:0;
			this.resultArray[this.counter+1] && this.resultArray[this.counter+1].removeHover();
			this.resultArray[this.counter].highlight();
		}else if(e.keyCode==40 && arrayLength>0){
			this.resultArray[this.counter] && this.resultArray[this.counter].removeHover();
			this.counter = this.counter<arrayLength-1?this.counter+1:0;
			
			this.resultArray[this.counter].highlight();
		}
		else if (e.keyCode==13){
			if(this.resultArray[this.counter] && this.resultArray[this.counter].isHighlighted){
				this.resultArray[this.counter].selected();

				//this.clearResult();

			}
		}

	},
	clearResult: function(){
		
		this.resultArray=null;
		this.resultList.empty();
	}
});

return AutocompleteView;


})($,_,Backbone);