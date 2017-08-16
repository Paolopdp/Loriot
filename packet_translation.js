
	/**

		In this editor, you can define your custom javascript code to parse the incoming data.	
	
		The following ables are available:
	
		data     : hex string of the data
		p	     : array of bytes represented as string of 2 hex digits 
		v        : array of bytes represented as integers
		msg.EUI  : device EUI
		msg.fcnt : message frame counter
		msg.port : message port field
		msg.ts   : message timestamp as number (epoch)
	
		Last line of your script will be printed to the data payload column.

	*/

/** Conversione little endian, da esadecimale a  decimale in virgola mobile*/
function littleEndianConversion (b1,b2,b3,b4){
		hexstringa = b4+b3+b2+b1;
		binstringa = parseInt( hexstringa , 16).toString( 2 );
		binstringa = "0"+binstringa;
		esponentebin = binstringa.substr( 1 , 8 );
		esponentedec = parseInt( esponentebin , 2 );
		esponente = esponentedec - 127;
		result=0;
		k=1;
		mantissa=binstringa.substr( 9 , 23);
		for ( i=9 ; i<31 ; i++ ){
			num=binstringa.charAt(i);
			determinatore = Math.pow( 2 , k );
			temp = parseInt(num)/determinatore;
			result = result+temp;	
			k=k+1;
		}
		valore=((1+result)*Math.pow(2,esponente)).toFixed(2);	
		return valore;
	}
/** Funzione di conversione da esadecimale a ASCII*/
function hex2a(hexx) {
    hex = hexx.toString();
    str = '';
    for (i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function statusByteMagnetico(b1) {
	switch ( b1 ){
		case "04":
			stato = "Batteria Scarica";
			break;
		case "03":
			stato = "Manomissione e porta aperta";
			break;
		case "02":
			stato = "Manomissione e porta chiusa";
			break;
		case "01":
			stato = "Apertura porta";
			break;
		case "00":
			stato = "Chiusura porta";
				break;
		default:
				break;
			}
	return stato;
}

function statusByteInfrarossi(b1) {
	switch ( b1 ){
		case "04":
			stato = "Batteria Scarica";
			break;
		case "03":
			stato = "Manomissione e Intrusione";
			break;
		case "02":
			stato = "Manomissione";
			break;
		case "01":
			stato = "Intrusione";
			break;
		case "00":
			stato = "Tutto ok";
			break;
		default:
			break;
			}
	return stato;
}
/** Sensore magnetico */
if (msg.EUI=="0E7E346433306947" || msg.EUI=="0E7E346433306944"){
	switch(msg.port) {
		/** Dalla porta 5 viene consegnato un messaggio che contiene il modello del sensore */
		case  5:
			printed="Modello sensore: " + data;
			break;
		/** Dalla porta 6 viene consegnato un messaggio che contiene il numero seriale del sensore */
		case  6:
			printed="Numero seriale: " + data;
			break;
		case  7:
			/** FW release */
		    b1 = data.substr  ( 0  , 2 );
			b2 = data.substr  ( 2 , 2 );
			b3 = data.substr  ( 4 , 2 );
			/** Separatore, è una virgola */
			b4 = data.substr  ( 6  , 2 );
			/** LoRaWAN client library release */
			b5 = data.substr  ( 8  , 2 );
			b6 = data.substr  ( 10 , 2 );
			b7 = data.substr  ( 12 , 2 );
			b8 = data.substr  ( 14 , 2 );
			b9 = data.substr  ( 16 , 2 );
			/** Separatore, è una virgola */
			b10 = data.substr ( 18 , 2 );
			/** Hw release */			
			b11 = data.substr ( 20 , 2 );

			/** Operazioni sui dati */		
			FWrelease=hex2a(b1+b2+b3);
			separatore1=hex2a(b4);
			LWlibrary=hex2a(b5+b6+b7+b8+b9);
			separatore2=hex2a(b10);
			Hwrelease=hex2a(b11);
			printed = (" Fw release: " + FWrelease + separatore1 +" LoRaWAN client library release: " + LWlibrary + separatore2 + " Hw release: " + Hwrelease);
			break;
		case  8:
			/** Batteria */
		    b1 = data.substr  ( 0  , 2 );
			/** Se batteria alcalina, allora togliere -128 */
			batteria = parseInt( b1 , 16);
			batteria = batteria-128;
			printed = (" Batteria: " + batteria + "%");
			break;
		case  9:
			/** Batteria */
		    b1 = data.substr  ( 0  , 2 );
			/** Status */
			b2 = data.substr  ( 2 , 2 );
			/** Temperatura */
			b3 = data.substr  ( 4 , 2 );
			b4 = data.substr  ( 6  , 2 );
			b5 = data.substr  ( 8  , 2 );
			b6 = data.substr  ( 10 , 2 );
			/** Umidità */
			b7 = data.substr  ( 12 , 2 );
			b8 = data.substr  ( 14 , 2 );
			b9 = data.substr  ( 16 , 2 );
			b10 = data.substr ( 18 , 2 );

			/** Operazioni sui dati */
			/** Se batteria alcalina, allora togliere -128 */
			batteria = parseInt( b1 , 16);			
			batteria = batteria-128;
			/** Status */
			stato=statusByteMagnetico(b2);
			/** Temperatura */	
			temperatura = littleEndianConversion(b3,b4,b5,b6);
			temperatura = temperatura+"°C";
			/** Umidità */
			umidita = littleEndianConversion(b7,b8,b9,b10);
			umidita = umidita+"%";
			printed = (" Batteria: " + batteria + "%" + "<br>" + " Stato: " + stato + "<br>"+" Temperatura: " + temperatura + "<br>" + " Umidità: " + umidita);
			break;
		case  10:
			printed = (" ACK : " + data);
			break;
		case 30:
			/** Status */
		    b1 = data.substr  ( 0  , 2 );
			/** Contatore aperture porta */
			b23 = data.substr  ( 2 , 4 );
			/** Temperatura */
			b4 = data.substr  ( 6  , 2 );
			b5 = data.substr  ( 8  , 2 );
			b6 = data.substr  ( 10 , 2 );
			b7 = data.substr  ( 12 , 2 );
			/** Umidità */
			b8 = data.substr  ( 14 , 2 );
			b9 = data.substr  ( 16 , 2 );
			b10 = data.substr ( 18 , 2 );
			b11 = data.substr ( 20 , 2 );
			
			/** Operazioni sui dati */

			/** Status */
			stato=statusByteMagnetico(b1);
			/** Contatore aperture porta */
			count = parseInt ( b23 , 16 );
			/** Temperatura */	
			temperatura = littleEndianConversion(b4,b5,b6,b7);
			temperatura = temperatura+"°C";
			/** Umidità */
			umidita = littleEndianConversion(b8,b9,b10,b11);
			umidita = umidita+"%";
			printed = (" Stato: " + stato + "<br>" +" Contatore: " + count + "<br>" + " Temperatura: " + temperatura + "<br>" + " Umidità: " + umidita);
		    break;
		default:
			printed = "Porta non implementata";
			break;
	}
}

/** Sensore infrarossi */
if (msg.EUI=="0E7E3464333062A6" || msg.EUI=="0E7E346433306386"){
	switch(msg.port) {
		case  5:
			printed="Modello sensore: " + data;
			break;
		case  6:
			printed="Numero seriale: " + data;
			break;
		case  7:
			/** FW release */
		    b1 = data.substr  ( 0  , 2 );
			b2 = data.substr  ( 2 , 2 );
			b3 = data.substr  ( 4 , 2 );
			/** Separatore */
			b4 = data.substr  ( 6  , 2 );
			/** LoRaWAN client library release */
			b5 = data.substr  ( 8  , 2 );
			b6 = data.substr  ( 10 , 2 );
			b7 = data.substr  ( 12 , 2 );
			b8 = data.substr  ( 14 , 2 );
			b9 = data.substr  ( 16 , 2 );
			/** Separatore */
			b10 = data.substr ( 18 , 2 );
			/** Hw release */			
			b11 = data.substr ( 20 , 2 );

			/** Operazioni sui dati */		
			FWrelease=hex2a(b1+b2+b3);
			separatore1=hex2a(b4);
			LWlibrary=hex2a(b5+b6+b7+b8+b9);
			separatore2=hex2a(b10);
			Hwrelease=hex2a(b11);
			printed = (" Fw release: " + FWrelease + separatore1 +" LoRaWAN client library release: " + LWlibrary + separatore2 + " Hw release: " + Hwrelease);
			break;
		case  8:
			/** Batteria */
		    b1 = data.substr  ( 0  , 2 );
			/** Se batteria litio, allora aggiungere 128 */
			batteria = parseInt( b1 , 16);
			printed = (" Batteria: " + batteria + "%");
			break;
		case  9:
			
			/** Batteria */
		    b1 = data.substr  ( 0  , 2 );
			/** Status */
			b2 = data.substr  ( 2 , 2 );
			/** Numero Aperture */
			b34 = data.substr  ( 4 , 4 );
			/** Operazioni sui dati */
			/** Se batteria litio, allora aggiungere 128  */
			batteria = parseInt( b1 , 16);
			/** Status */
			stato=statusByteInfrarossi(b2);
			/** Contatore aperture porta */
			count = parseInt ( b34 , 16 );
			printed = (" Batteria: " + batteria + "%" + "<br>" + " Stato: " + stato + "<br>" + " Contatore: buggato -> " + count);
			break;

		case  10:
			printed = (" ACK : " + data);
			break;
		case 20:
			/** Status */
		    b1 = data.substr  ( 0  , 2 );
			/** Contatore aperture porta */
			b23 = data.substr  ( 2 , 4 );
			
			/** Operazioni sui dati */

			/** Status */
			stato=statusByteInfrarossi(b1);
			/** Contatore aperture porta */
			count = parseInt ( b23 , 16 );
			printed = (" Stato: " + stato + "<br>" +" Contatore: " + count);
		    break;
		default:
			printed = "Porta non implementata";
			break;
	}
}
	switch(msg.EUI){
		case "0E7E3464333062A6":
			sensore="ABP, infrarossi";
		break;
		case "0E7E346433306386":
			sensore="OTAA, infrarossi";
		break;
		case "0E7E346433306947":
			sensore="OTAA, magnetico";
		break;
		case "0E7E346433306944":
			sensore="ABP, magnetico";
		break;
	}

	printed=(printed+"<br>Tipologia sensore: "+sensore);
	printed;
