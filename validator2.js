function Validator(selector){
    var formRules = {};
    var _this = this;
    function getParent (element,selector){
        while (element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }
    var validatorRules = {
        required: function(value){
            return value ? undefined : 'Truong nay khong duoc bo trong';
        },
        email:function(value){
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return regex.test(value) ? undefined : 'Truong nay phai la email';
        },
        min: function(min){
            return function(value){
                return value.length >= min? undefined : `Vui long nhap it nhat ${min} ky tu`;
                
            }
        }
    };
    var formElement = document.querySelector(selector);
    if (formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(var input of inputs) {
    
          var rules = input.getAttribute('rules').split('|'); 
            for (var rule of rules) {
                var isRuleHasValue = rule.includes(':');
                if(isRuleHasValue){
                    var ruleInfo = rule.split(':')
                    
                    rule = ruleInfo[0]
                }
                var ruleFunction = validatorRules[rule];
                if(isRuleHasValue){
                    ruleFunction = ruleFunction(ruleInfo[1])
                }
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunction)
                }else{
                    formRules[input.name] = [ruleFunction]
                }
            }
            input.onblur = handleValidateBlur;
            input.oninput = handleValidateInput;

        }
        function handleValidateBlur(e){
            var rules = formRules[e.target.name]
            var errorMessage;
            for(var rule of rules){
                errorMessage = rule(e.target.value);
                if(errorMessage)break;
            }
            if(errorMessage){
                var parentElement = getParent(e.target,'.form-group')
                if(parentElement){
                    parentElement.classList.add('invalid');
                    var formMessage = parentElement.querySelector('.form-message')
                    if(formMessage){
                        formMessage.innerHTML = errorMessage;
                    }
                }
            }
            return !errorMessage;
        }
        function handleValidateInput(e){
            var parentElement = getParent(e.target,'.form-group')
            if(parentElement){
                parentElement.classList.remove('invalid');
                var formMessage = parentElement.querySelector('.form-message')
                if(formMessage){

                    formMessage.innerHTML = '';
                }
            }

        }

        formElement.onsubmit = function(e){
            e.preventDefault();
            var isValid = true;
            var inputs = formElement.querySelectorAll('[name][rules]');
            for(var input of inputs) {
                if(!handleValidateBlur({target: input})){
                    isValid = false;
                }
            }
            if(isValid){
                if(typeof _this.onSubmit === 'function'){
                    var inputSelector = formElement.querySelectorAll('[name]:not([disabled])');
                    var inputMessage = Array.from(inputSelector).reduce(function(values,input){
                        switch(input.type){
                            case 'checkbox':
                                if(!input.matches(':checked'))                
                                    return values;
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value)
                                break;
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    },{}) 
                    _this.onSubmit(inputMessage);
                }
                else{
                    formElement.submit();
                }
            }

        }
    }
}