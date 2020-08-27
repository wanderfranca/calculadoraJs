class CalcController {

    constructor() {

        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = []
        this._locale = 'pt-BR'; //Atributo com o padrão local
        this._displayCalcEl = document.querySelector("#display"); //Atributo para o Display
        this._dateEl = document.querySelector("#data"); //Atributo responsável pela Data
        this._timeEl = document.querySelector("#hora"); //Atributo responspável pela Hora
        this._currentDate;
        this.initialize();
        this.initButtonEvents();
        this.initKeyboard(); // Inicializa os eventos do teclado
         //

    }


    pasteFromClipboard(){
        document.addEventListener('paste', e=> {
           let text = e.clipboardData.getData('Text');

           this.displayCalc = parseFloat(text);

           console.log(text)
        })
    }


  
    //Método CTRL C + CRTL V
    copyToClipboard(){

        let input = document.createElement('input');

        input.value = this.displayCalc;

        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');

        //Após copiar ele não deixará mostrar na tela, pois removerá o INPUT
        input.remove();

    }

    initialize() {

        setInterval(() => {

            this.setDisplayDateTime();

        }, 1000); //relógio rolando a cada 1 segundo

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=> {
            
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();

            });
        });

    }

    //Método que verifica o botão do audio
    toggleAudio() {

        this._audioOnOff = (this._audioOnOff) ? false : true;

    }

    //Método que toca o Audio
    playAudio() {

        if (this._audioOnOff) {

            this._audio.currentTime = 0;
            this._audio.play();

        }
    }

    //Método de Controle do teclado
    initKeyboard(){

        document.addEventListener('keyup', e=>{

            this.playAudio();

            switch (e.key) {
                
                case 'Escape':
                    this.clearAll();
                    break;

                case 'Backspace':
                    this.clearEntry();
                    break;

                case '+':              
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case ',':
                case '.':    
                    this.addDot();
                    break;

                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if (e.ctrlKey) this.copyToClipboard()
                    break;

      
            }
        

        })

    }


    //Método para reconhecer o evento ao clicar no boão
    addEventListenerAll(element, events, fn) {

        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false);
        });

    }

    clearAll() {

        this._operation = [];
        this.lastNumber = '';
        this._lastOperator = '';
    
        this.setLastNumberToDisplay();

    }

    clearEntry() {

        this._operation.pop();
        this.setLastNumberToDisplay();

    }

    soma() {

    }

    getLastOperation() {

        return this._operation[this._operation.length - 1];

    }

    setLastOperation(value) {
        this._operation[this._operation.length - 1] = value;
    }
    //Operadores
    isOperator(value) {
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);
    }

    pushOperation(value) {
        this._operation.push(value);
        if (this._operation.length > 3) {


            //chamar método que calclule
            this.calc();


        }
    }

    getResult() {

        try{
       
            return eval(this._operation.join(""));
        
        } catch(e){
            setTimeout(() =>{
                this.setError();
            }, 1);
            
        }
    }

    //Método que realiza os cálculos
    calc() {

        let last = '';
        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){
            
            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];
        }


        if (this._operation.length > 3) {
            last = this._operation.pop();

            
            this._lastNumber = this.getResult();


        } else if (this._operation.length == 3){

            this._lastNumber = this.getLastItem(false);
        }


        let result = this.getResult();

        if (last == '%') {

            result /= 100;
            this._operation = [result];

        } else {


            this._operation = [result];

            if (last) this._operation.push(last);
        }

        this.setLastNumberToDisplay();
    }
    
    //Método que pega o ultimo item
    getLastItem(isOperator = true){

        let lastItem;
        for (let i = this._operation.length - 1; i >= 0; i--){
            if (this.isOperator(this._operation[i]) == isOperator){
                lastItem = this._operation[i];
                break;
            }

            if (!lastItem) {

                lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
            }

        }

        return lastItem;

    }

    //Método que busca o ultimo valor e coloca no display
    setLastNumberToDisplay() {

        let lastNumber = this.getLastItem(false)

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }


    //Adicionar uma nova operação
    addOperation(value) {

        //Se não for um número
        if (isNaN(this.getLastOperation())) {

            if (this.isOperator(value)) {

                this.setLastOperation(value);

            } else {

                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        } else {

            if (this.isOperator(value)) {

                this.pushOperation(value);

            } else {

                //Modificar o número - Convertendo para Int
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                //Atualizar Display

                this.setLastNumberToDisplay();

            }


        }

    }

    setError() {
        this.displayCalc = "ERROR";

    }

    //Método que controla o PONTO
    addDot() {

        let lastOperation = this.getLastOperation();

        //A variável lastoperation do tipo string tem um ponto nela? Se tem pare!
        if(typeof lastOperation === "string" && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');

        } else {
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }

    execBtn(value) {

        this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }
    }

    initButtonEvents() {

        //Usando o querySelectorAll para pegar todos os botões e partes de TAG G
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index) => {

            this.addEventListenerAll(btn, "click drag", e => {
                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);

            });

            //Mudando o ponteiro do mouse para o dedo nos eventos mouseover, mouseup e mousedown
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {
                btn.style.cursor = "pointer";
            });

        });


    }

    //Método para Data e Hora atual aparecem instataneamente
    setDisplayDateTime() {

        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }

    get displayTime() {

        return this._timeEl.innerHTML;

    }

    set displayTime(value) {

        return this._timeEl.innerHTML = value;

    }

    get displayDate() {

        return this._dateEl.innerHTML;

    }

    set displayDate(value) {

        return this._dateEl.innerHTML = value;

    }

    get displayCalc() {

        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value) {

        if (value.toString().length > 10) {
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;

    }

    get currentDate() {

        return new Date();
    }

    set currentDate(value) {

        this._currentDate = value;

    }

}