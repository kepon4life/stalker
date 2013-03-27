YUI.add("lang/inputex_de", function(Y) {

    Y.Intl.add(

    "inputex", // associated module
    "de",   // BCP 47 language tag
    {

   required: "Pflichtfeld",
   invalid: "Eingabe nicht korrekt",
   valid: "Eingabe korrekt",
   
   invalidEmail: "Email nicht korrekt, ej: ihr.name@beispiel.de",
   selectColor: "Farbe w�hlen:",
   invalidPassword: ["Das Passwort muss aus mindestens "," Zeichen bestehen"],
   invalidPasswordConfirmation: "Das Passwort stimmt nicht �berein!",
   passwordStrength: "Das Passwort ist zu schwach",
   capslockWarning: "Achtung: die caps-lock Taste ist aktiviert",
   invalidDate: "falsches Datumsformat, bsp: 25.01.2007",
   defaultDateFormat: "d.m.Y",
   shortMonths: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dez"],
   months: ["Januar", "Februar", "M�rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
   weekdays1char: ["S", "M", "D", "M", "D", "F", "S"],
   shortWeekdays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
   selectMonth: "- Monat ausw�hlen -",
   dayTypeInvite: "Tag",
   monthTypeInvite: "Monat",
   yearTypeInvite: "Jahr",
   cancelEditor: "Abbrechen",
   okEditor: "Ok",
   defaultCalendarOpts: {
      navigator: {
        strings : {
            month: "Monat ausw�hlen",
            year: "Jahr erg�nzen",
            submit: "Ok",
            cancel: "Abbrechen",
            invalidYear: "Jahr stimmt nicht"
         }
      },
      start_weekday: 1 // Woche beginnt am Montag
   },
   stringTooShort: ["Dieses Feld braucht mindestens "," Zeichen (Buchstaben oder Zahlen)"],
   stringTooLong: ["Dieses Feld ist begrenzt auf "," Zeichen (Buchstaben oder Zahlen)"],
   ajaxWait: "lade...",
	menuTypeInvite: 'Ausw�hlen',
	didYouMean: 'Meinten Sie: ',
	emptyInPlaceEdit: '(Bearbeiten)',
   
   // List
   listAddLink: "Hinzuf�gen",
   listRemoveLink: "L�schen",
   

   // Datatable
   saveText: "Speichern",
   cancelText: "Abbrechen",
   modifyText: "Bearbeiten",
   deleteText: "L�schen",
   insertItemText: "Einf�gen",
   confirmDeletion: "M�chten Sie das Element wirklich l�schen?",
   
      
   // TimeInterval
   timeUnits: {
      SECOND: "Sekunden",
      MINUTE: "Minuten",
      HOUR: "Stunden",
      DAY: "Tage",
      MONTH: "Monate",
      YEAR: "Jahre"
   }
   

 });

 Y.inputEx.messages = Y.Intl.get("inputex");

},
'3.1.0', {
 requires: ['inputex']
});
