function Validator(options) {
    function getParent(input,parent) {
        while (input.parentElement) {
            if(input.parentElement.matches(parent)){
                return input.parentElement
            }
            input = input.parentElement;
        }
    }
    var ruleSelector = {};
    function Validate(inputElement,rule) {
        //1.ta co inputElement.value la du lieu ng dung nhap vo 
        //2. ta con co ham rule.test(value) de kiem tra co loi hay khong
        var formMessage = getParent(inputElement, options.parentSelector).querySelector(options.formMessage)
        var errorMessage;

        //duyet qua tung cai rule neu cai nao co 2 rule thi xu ly 
        var rules =  ruleSelector[rule.selector];
        for(var i = 0; i < rules.length; i++) {
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                 errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                 errorMessage = rules[i](inputElement.value);

            }
            if(errorMessage) {break;}
        }

        if(errorMessage) {
            formMessage.innerHTML = errorMessage;
            getParent(inputElement, options.parentSelector).classList.add('invalid')
        }else {
            formMessage.innerHTML = '';
            getParent(inputElement, options.parentSelector).classList.remove('invalid')

        }
        return !errorMessage;
    }
    // options.rules , options.form
    //truyen vao de lay cai form muon validator
    var formElement = document.querySelector(options.form);
    if(formElement) {

        //xu ly submit
        formElement.onsubmit = function(e){
            e.preventDefault();
            var isFormValid = true;
            options.rules.forEach(function(rule){
                var inputElement = formElement.querySelector(rule.selector)
                var isValid = Validate(inputElement,rule)
                if(!isValid){
                    isFormValid = false;
                }
            })
            if(isFormValid){
                if(typeof options.onSubmit === 'function'){
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
                    options.onSubmit(inputMessage);
                }
                else{
                    formElement.submit();
                }
            }

        }
        //chay de loc qua ca rule co trong ham lay ra selector, rule.test || rule.test()chay ham
        options.rules.forEach(function(rule){

            //lay ra cac rules 
            if(Array.isArray(ruleSelector[rule.selector])){
                ruleSelector[rule.selector].push(rule.test)
            }else[
                ruleSelector[rule.selector] = [rule.test]
            ]


            var inputElements = formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement){
                if(inputElement) {
                    //tien hanh blur ra
                    inputElement.onblur = function() {
                        Validate(inputElement,rule)
                        
                    }
                    inputElement.oninput = function() {
                        var formMessage = getParent(inputElement, options.parentSelector).querySelector(options.formMessage)
    
                        formMessage.innerHTML = '';
                        getParent(inputElement, options.parentSelector).classList.remove('invalid')
                    }
                }
            })
            
        })
    }
}
//quy dinh o day la 
//neu ma khong co loi thi => undefined
Validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value){
            return value ? undefined : 'Truong nay khong duoc de trong';
        }
    }

}
Validator.isEmail = function(selector){
    return {
        selector: selector,
        test: function(value){
            var regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            return regex.test(value) ? undefined : 'Truong nay phai la email';
        }
    }
}
Validator.minLength = function(selector,min) {
    return {
        selector: selector,
        test: function(value){
            return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ky tu`;
        }
    }

}
Validator.isConfirm = function(selector,getConfirmPassword, customMessage) {
    return {
        selector: selector,
        test: function(value){
            return value === getConfirmPassword() ? undefined : customMessage || 'Du lieu nhap vao khong chinh xac';
        }
    }

}
