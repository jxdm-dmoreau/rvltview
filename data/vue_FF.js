/*********************************************************************************
*    This file is part of ZoryaZilla Fusion merged with mountyzilla              *
*********************************************************************************/
//============================ ZZ PRE CODE =======================================
// Couverture du script (en nombre de caverne)
var ZPREF="";
ZPREF+="&ZTRO="+ZTRO;
ZPREF+="&ZMON="+ZMON;
ZPREF+="&ZTRE="+ZTRE;
ZPREF+="&ZLIE="+ZLIE;
//var ZTRO=MZ_getValue(numTroll+".pref.ZTRO");  if (!ZTRO) ZTRO=0;  ZPREF+="&ZTRO="+ZTRO;
//var ZMON=MZ_getValue(numTroll+".pref.ZMON");  if (!ZMON) ZMON=5;  ZPREF+="&ZMON="+ZMON;
//var ZTRE=MZ_getValue(numTroll+".pref.ZTRE");  if (!ZTRE) ZTRE=5;  ZPREF+="&ZTRE="+ZTRE;
//var ZLIE=MZ_getValue(numTroll+".pref.ZLIE");  if (!ZLIE) ZLIE=15; ZPREF+="&ZLIE="+ZLIE;

var NUM_TROLL=numTroll;			// Id du Troll
var cg=new Array();				// Diplo des guildes
var ct=new Array();				// Diplo des trolls
var infosTrolls=new Array();	// Carac des Trolls de la coterie
var MeInsulte=new Array();	    // Monstre insulte par les Trolls de la coterie
var gogo = new Array();         // Pour les gowaps de la coterie
var fam = new Array();        	// Pour les Familiers de la coterie
var infosPieges = new Array();  // Pour les pieges
var infosVue = new Array();  	// Pour le gestionnaire de vue
var infosAlertePiege=false;		// Alert si piège à une case
var infosAlerteTrou=false;		// Alert si trou a 1 case
var tresorInfo=new Array();		// Carac des Trésros de la coterie
var listeCDM=new Array();		// Tableaux des CdM
var rowCdm=new Array();			// Tableau pour le popup des CdM
//var isLevelComputed=false;		// Colonne des niveau des monstres
var nbCDM=0;					// N° de CdM pour popup
var incT=0;						// Décalage des colonnes sur les trolls
var incM=0;						// Décalage des colonnes sur les monstres
var bookedCase=new Array();		// Trésor occupé par un trolls ou monstres
var listeEngage=new Array(); 	// Utilisé pour supprimer les monstres "engagés"
var idMonstres="";				// Liste des monstres les plus proches
var idMatos="";					// Liste du matos le plus proches
var infoMonstreStep=0;			// pour steping de la fonction setInfosMonstres
var externalVue=false; 			// Pour traitement spécifique des vues externes à MH
var flowVueCtrl="Mon"; 			// Pour traitement du flux VUE
var flowVueCtrlId=3; 			// Pour traitement du flux VUE
var flowVueCtrlMaxId=0; 		// Pour traitement du flux VUE (affichage)

var isStyleClass = MZ_getValue("USECSS") == "true";
var MM_TROLL=MZ_getValue("MM_TROLL");
var RM_TROLL = MZ_getValue("RM_TROLL");
//var ITM_HandiZilla=MZ_getValue(NUM_TROLL+".pref.ITM_HandiZilla");
//var SkinZZ=MZ_getValue(NUM_TROLL+".pref.SkinZZ"); if (!SkinZZ) SkinZZ=ZZDB+"/skin/";			// => dans libs_FF.js

var totaltab=document.getElementsByTagName('table');
var itbid=-1;	//Bidiview pas toujours présente
for (i=0; i<totaltab.length; i++) {
	var ttab="";	
	try {ttab=totaltab[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue;} catch (e) {}			
	if (ttab=="LA VUE") { externalVue=true; }			
	if ((ttab=="MA VUE")||(ttab=="LA VUE")) {var itinf=i+1; }			
	if (ttab=="MONSTRES ERRANTS") {var itmon=i-1;}	
	if (ttab=="TROLLS") {var ittro=i-1;}			
	if (ttab=="TRÉSORS"){var ittre=i-1;}			
	if (ttab=="CHAMPIGNONS") {var itcha=i-1;}		
	if (ttab=="LIEUX PARTICULIERS") {var itlie=i-1;}
	try {ttab=totaltab[i].childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue;} catch (e) {}			
	if (ttab=="B I D I V I E W") {itbid=i;}			
}

// Pointeurs sur Tableaux Infos, Monstres, Trolls, Trésors, Champis et Lieux
if (itbid>0) var tbid = totaltab[itbid];		
var tinf = totaltab[itinf];
var tmon = totaltab[itmon]; 
var ttro = totaltab[ittro]; 
var ttre = totaltab[ittre]; 
var tcha = totaltab[itcha]; 
var tlie = totaltab[itlie]; 

function getTrollGuildeID(i) {
	var shift = (incT == 0 ? 0 : 1);
	if(x_trolls[i].childNodes[5+shift].firstChild.nodeName=="A")
	{
		var href = x_trolls[i].childNodes[5+shift].firstChild.getAttribute("href");
		return href.substring(href.indexOf('(')+1,href.indexOf(","));
	}
	return 1;
}

function putRealDiplo() {
	var useCss = MZ_getValue("USECSS") == "true";
	for (var i = nbTrolls+1; --i >= 3;) {
		var troll = x_trolls[i];
		var cl = ct[getTrollID(i)];
		var guildeID = getTrollGuildeID(i);
		if (cl) {
			if (useCss && cl == '#AAFFAA')
				troll.setAttribute('class', 'mh_trolls_amis');
			else if (useCss && cl == '#FFAAAA')
				troll.setAttribute('class', 'mh_trolls_ennemis');
			else if (useCss && cl == '#FFD3D3')
				troll.setAttribute('class', 'mh_trolls_conflit');
			else {
				troll.setAttribute('class', '');
				troll.style.backgroundColor = cl;
			}
		} else if (guildeID!=1) {
			cl = cg[guildeID];
			if (!cl)
				continue;
			if (useCss && cl == '#AAFFAA')
				troll.setAttribute('class', 'mh_guildes_amis');
			else if (useCss && cl == '#FFAAAA')
				troll.setAttribute('class', 'mh_guildes_ennemis');
			else if (useCss && cl == '#BBBBFF')
				troll.setAttribute('class', 'mh_guildes_perso');
			else if (useCss && cl == '#FFD3D3')
				troll.setAttribute('class', 'mh_guildes_conflit');
			else {
				troll.setAttribute('class', '');
				troll.style.backgroundColor = cl;
			}
		}
	}
}

/*********************************************************************************
*    This file is part of Mountyzilla.                                           *
*                                                                                *
*    Mountyzilla is free software; you can redistribute it and/or modify         *
*    it under the terms of the GNU General Public License as published by        *
*    the Free Software Foundation; either version 2 of the License, or           *
*    (at your option) any later version.                                         *
*                                                                                *
*    Mountyzilla is distributed in the hope that it will be useful,              *
*    but WITHOUT ANY WARRANTY; without even the implied warranty of              *
*    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the               *
*    GNU General Public License for more details.                                *
*                                                                                *
*    You should have received a copy of the GNU General Public License           *
*    along with Mountyzilla; if not, write to the Free Software                  *
*    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA  *
*********************************************************************************/

var checkBoxGG, checkBoxCompos, checkBoxBidouilles, checkBoxIntangibles, checkBoxDiplo, checkBoxTrou, checkBoxEM, checkBoxTresorsNonLibres, checkBoxTactique;
var checkBoxLevels, checkBoxGowaps, checkBoxEngages, checkBoxMythiques;
var comboBoxNiveauMin, comboBoxNiveauMax;
var filtreMonstre = "", filtreTroll = "", filtreGuilde = "", filtreTresor = "", filtreLieu = "";
var listeCDM = new Array();

// Infos remplies par des scripts extérieurs
var cg = new Array();
var ct = new Array();
var listeCDM = new Array();

var listeLevels = new Array();
var listeTags = new Array();
var listeTagsInfos = new Array();
var listeTagsGuilde = new Array();
var listeTagsInfosGuilde = new Array();

// Fenêtres déplaçables
var winCurr = null;
var offsetX, offsetY;
document.addEventListener('mousemove', drag, false);

// PX trolls
var bulle;

//Infos trolls 
var popup;

var nbCDM = 0;

var nbTabSup = 0;
var oldNOEM = true;

// Différents tableaux
var totaltab = document.getElementsByTagName('table');
var x_monstres = totaltab[4].getElementsByTagName('tr');
var nbMonstres = x_monstres.length - 1;
var x_trolls = totaltab[6].getElementsByTagName('tr');
var nbTrolls = x_trolls.length - 1;
var x_tresors = totaltab[8].getElementsByTagName('tr');
var nbTresors = x_tresors.length - 1;
var x_champis = totaltab[10].getElementsByTagName('tr');
var nbChampis = x_champis.length - 1;
var x_lieux = totaltab[12].getElementsByTagName('tr');
var nbLieux = x_lieux.length - 1;

var isCDMsRetrieved = false;
var isDiploComputed = false;

//Utilisé pour supprimer les monstres "engagés"
var listeEngages = new Array();
var isEngagesComputed = false;
var cursorOnLink=false;

// UTILITAIRES

function setCheckBoxCookie(checkBox, cookie) {
	var filtre = checkBox.checked;
	MZ_setValue(cookie, filtre ? "true" : "false");
	return filtre;
}

function getCheckBoxCookie(checkBox, cookie) {
	checkBox.checked = MZ_getValue(cookie) == "true";
}

function setComboBoxCookie(comboBox, cookie) {
	var filtre = comboBox.selectedIndex;
	MZ_setValue(cookie, filtre);
	return filtre;
}

function getComboBoxCookie(comboBox, cookie) {
	if(MZ_getValue(cookie)!=null)
		comboBox.value = MZ_getValue(cookie);
}


function synchroniseFiltres() {
	getComboBoxCookie(comboBoxNiveauMin, "NIVEAUMINMONSTRE");
	getComboBoxCookie(comboBoxNiveauMax, "NIVEAUMAXMONSTRE");
	getCheckBoxCookie(checkBoxGowaps, "NOGOWAP");
	getCheckBoxCookie(checkBoxMythiques, "NOMYTH");
	getCheckBoxCookie(checkBoxEngages, "NOENGAGE");
	getCheckBoxCookie(checkBoxLevels, "NOLEVEL");

	getCheckBoxCookie(checkBoxIntangibles, "NOINT");

	getCheckBoxCookie(checkBoxGG, "NOGG");
	getCheckBoxCookie(checkBoxCompos, "NOCOMP");
	getCheckBoxCookie(checkBoxBidouilles, "NOBID");

	getCheckBoxCookie(checkBoxDiplo, "NODIPLO");
	getCheckBoxCookie(checkBoxTrou, "NOTROU");
	getCheckBoxCookie(checkBoxTresorsNonLibres, "NOTRESORSNONLIBRES");
	getCheckBoxCookie(checkBoxTactique, "NOTACTIQUE");
	if(MZ_getValue("NOINFOEM") != "true")
		getCheckBoxCookie(checkBoxEM, "NOEM");
}

function getMonstreDistance(i) {
	return x_monstres[i].firstChild.firstChild.nodeValue;
}

function getMonstreID(i) {
	return x_monstres[i].childNodes[1].firstChild.nodeValue;
}

function getMonstreIDByTR(tr) {
	return tr.childNodes[1].firstChild.nodeValue;
}

function getMonstreLevelNode(i) {
	return x_monstres[i].childNodes[2];
}

function getMonstreLevel(i) {
	if(!isCDMsRetrieved)
		return -1;
	var id = getMonstreID(i);
	var donneesMonstre = listeCDM[id];
	if(!donneesMonstre)
		return -1;
	var level = donneesMonstre[0];
	return parseInt(level);
}

function getMonstreNom(i, force) {
	try
	{
		return x_monstres[i].childNodes[checkBoxLevels.checked && !force ? 2 : 3].firstChild.firstChild.nodeValue;
	}
	catch(e)
	{
		alert("Impossible de trouver le monstre "+i);
	}
}

function getMonstreNomByTR(tr, force) {
	return tr.childNodes[checkBoxLevels.checked && !force ? 2 : 3].firstChild.firstChild.nodeValue;
}

// Function getMonstrePosition() has been removed from MZ original code for ZZ Fusion


function updateTactique()
{
	var noTactique = setCheckBoxCookie(checkBoxTactique, "NOTACTIQUE");
	if(!isCDMsRetrieved)
		return;
	var imgUrl = SkinZZ+"MZ/calc2.png";
	if(noTactique)
	{
		for (var i = nbMonstres+1; --i >= 1;) 
		{
			var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
			var img = document.evaluate("img[@src='"+imgUrl+"']",
			tr, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if(img)
			{
				img.parentNode.removeChild(img.previousSibling);
				img.parentNode.removeChild(img);
			}
		}
	}
	else
	{
		computeTactique();
	}
}

var needComputeEnchantement = MZ_getValue(numTroll+".enchantement.liste") && MZ_getValue(numTroll+".enchantement.liste")!="";

function filtreMonstres() {
	var urlImg = SkinZZ+"MZ/Competences/ecritureMagique.png";
	var urlEnchantImg = SkinZZ+"MZ/enchant.png";
	var useCss = MZ_getValue("USECSS") == "true";
	var noGowaps = setCheckBoxCookie(checkBoxGowaps, "NOGOWAP");
	var noMythiques = setCheckBoxCookie(checkBoxMythiques, "NOMYTH");
	var noEngages = setCheckBoxCookie(checkBoxEngages, "NOENGAGE");
	var niveau_min = setComboBoxCookie(comboBoxNiveauMin, "NIVEAUMINMONSTRE");
	var niveau_max = setComboBoxCookie(comboBoxNiveauMax, "NIVEAUMAXMONSTRE");
	var noEM = true;
	if(MZ_getValue("NOINFOEM") != "true")
		noEM = setCheckBoxCookie(checkBoxEM, "NOEM");
	if (noEngages && !isEngagesComputed) {
		for (var i = nbTrolls+1; --i >= 3;) {
			var pos = getTrollPosition(i);
			if (!listeEngages[pos[0]])
				listeEngages[pos[0]] = new Array();
			if (!listeEngages[pos[0]][pos[1]])
				listeEngages[pos[0]][pos[1]] = new Array();
			listeEngages[pos[0]][pos[1]][pos[2]] = 1;
		}
		isEngagesComputed = true;
	}
	var filtre = filtreMonstre != "";
	totaltab[4].firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.
				nodeValue = "MONSTRES ERRANTS" + (filtre ? " (filtrés sur " + filtreMonstre + ")" : "");
	if(niveau_min>0 || niveau_max>0)
	{
		var node = totaltab[4].firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild.firstChild;
		if(niveau_max>0)
			node.nodeValue += " "+niveau_max+ " >=";
		node.nodeValue += " NIVEAU";
		if(niveau_min>0)
			node.nodeValue += " >= "+niveau_min;
	}
	for (var i = nbMonstres+1; --i >= 3;) {
		var pos = getMonstrePosition(i);
		var nom = getMonstreNom(i).toLowerCase();
		if(noEM != oldNOEM)
		{
			if(noEM)
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				while(tr.childNodes.length>1)
					tr.removeChild(tr.childNodes[1]);
			}
			else
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				var TypeMonstre=getEM(nom);
				if (TypeMonstre!="") {
				   var infosCompo=compoEM(TypeMonstre);
				   if(infosCompo.length>0)
				   {
						tr.appendChild(document.createTextNode(" "));
						tr.appendChild(createImage(urlImg, infosCompo));
					}
				}
			}
		}
		if(needComputeEnchantement || (noEM != oldNOEM && noEM))
		{
			var texte = getInfoEnchantementFromMonstre(nom);
			if(texte!="")
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createImage(urlEnchantImg, texte));
			}
		}
		x_monstres[i].style.display =
				(noGowaps && nom.indexOf("gowap apprivoisé") != -1 && getMonstreDistance(i) > 1)
				|| (noEngages &&  getMonstreDistance(i)!=0 && listeEngages[pos[0]] && listeEngages[pos[0]][pos[1]] && listeEngages[pos[0]][pos[1]][pos[2]])
				|| (filtre && nom.indexOf(filtreMonstre) == -1)
				|| ( niveau_min>0 && getMonstreLevel(i)<niveau_min && getMonstreDistance(i) > 1 && getMonstreDistance(i)!=-1 && nom.toLowerCase().indexOf("super bouffon") == -1 && nom.toLowerCase().indexOf("kilamo") == -1)
				|| ( niveau_max>0 && getMonstreLevel(i)>niveau_max && getMonstreDistance(i) > 1 && getMonstreDistance(i)!=-1 && nom.toLowerCase().indexOf("super bouffon") == -1 && nom.toLowerCase().indexOf("kilamo") == -1)
				? 'none' : '';
		if(nom.indexOf('liche')==0 || nom.indexOf('hydre')==0 || nom.indexOf('balrog')==0 || nom.indexOf('beholder')==0)
			if (!noMythiques)
			{
				if(useCss)
					x_monstres[i].setAttribute('class', 'mh_trolls_ennemis');
				else {
					x_monstres[i].setAttribute('class', '');
					x_monstres[i].style.backgroundColor = '#FFAAAA';
				}
			}
			else 
			{
				x_monstres[i].style.backgroundColor = "";
				x_monstres[i].setAttribute('class', 'mh_tdpage');
			}
	}
	if(MZ_getValue("NOINFOEM") != "true")
	{
		if(noEM != oldNOEM)
		{
			if(noEM)
				computeChargeProjoMonstre();
			if(noEM && isCDMsRetrieved)
			{
				computeMission();
			}
		}
		oldNOEM = noEM;
	}
	needComputeEnchantement = false;
}

function filtreLevels() {
     if (nbMonstres<=1) return;			// si pas de monstre pas de traitement du level
	if (!setCheckBoxCookie(checkBoxLevels, "NOLEVEL")) {
		insertLevelColumn();
		if (!isCDMsRetrieved)
			retrieveCDMs();
		return;
	}
	if (!isCDMsRetrieved)
		return;
	x_monstres[2].removeChild(x_monstres[2].childNodes[2]);	for (var i = 3; i < nbMonstres+2; i++) {
		listeLevels[i] = getMonstreLevelNode(i).innerHTML;
		x_monstres[i].removeChild(getMonstreLevelNode(i));
	}
}

function retrieveCDMs() {
	if (checkBoxLevels.checked)
		return;
	var str = "";
	var begin = 3;
	var max = MZ_getValue("MAX_LEVEL");
	if(MZ_getValue('CDMID')==null)
		MZ_setValue('CDMID',1);
	max = Math.min(nbMonstres+1, (max == "" || max== null) ? 5000 : max);
	for (var i = 3; i < max; i++) {
		var nomMonstre = demarque(getMonstreNom(i, true));
		if(nomMonstre.indexOf(']') != -1)
			nomMonstre = nomMonstre.substring(0,nomMonstre.indexOf(']')+1);
		str += 'nom[]=' + escape(nomMonstre) + '$'
				+ (getMonstreDistance(i) <= 5 ? getMonstreID(i) : -getMonstreID(i)) + '&';
		if (i % 2000 == 0 || i == max - 1)
		{
			var url = ZZDB+'/mzMonstres.php';
			//?begin=' + begin+'&idcdm=' + MZ_getValue('CDMID') + '&' + str;
			MZ_xmlhttpRequest({
				method: 'POST',
				url: url,
				headers : {
					'User-agent': 'Mozilla/4.0 [FusionZoryaZilla] (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml',
					'Content-type':'application/x-www-form-urlencoded'
				},
				data: 'begin=' + begin+'&idcdm=' + MZ_getValue('CDMID') + '&' + str,
				onload: function(responseDetails) {
					try
					{
						var texte = responseDetails.responseText;
						var lines = texte.split("\n");
						if(lines.length==0)
							return;
						var begin2,end2,index;
						for(var j=0;j<lines.length;j++)
						{
								var infos = lines[j].split(";");
								if(infos.length<4)
									continue;
								var idMonstre=infos[0];
								var isCDM = infos[1];
								index = parseInt(infos[2]);
								var level = infos[3];
								infos=infos.slice(3);
								if(begin2==null)
									begin2=index;
								end2=index;
								listeCDM[idMonstre] = infos;
								if(isCDM==1)
									x_monstres[index].childNodes[2].innerHTML="<i>"+level+"</i>";
								else
									x_monstres[index].childNodes[2].innerHTML=level;
						}
						computeMission(begin2,end2); /*ZZ: appel de setInfosMonstres */ if (i == max) setInfosMonstres(1);
					}
					catch(e)
					{
						alert(e+"\n"+url+"\n"+texte);
					}
				}
			});

			//appendNewScript('http://mountypedia.free.fr/mz/monstres_FF.php?begin=' + begin
			//		+'&end='+(i == max - 1)+'&idcdm=' + MZ_getValue('CDMID') + '&' + str,
			//		x_lieux[nbLieux - 1].parentNode.parentNode.parentNode);
			str = "";
			begin = i + 1;
		}
	}
	isCDMsRetrieved = true;
}


function insertLevelColumn() {
	var tr = insertTdText(getMonstreLevelNode(2), 'Niveau', true);
	tr.setAttribute('width', '25');

	for (var i = nbMonstres+1; --i >= 3;) {
		var td = insertTdText(getMonstreLevelNode(i), '-');
		//td.addEventListener("click", function() {getCDM(getMonstreNom(i, true),getMonstreID(i));},true);
		td.addEventListener("click", function() {getCDM(getMonstreNomByTR(this.parentNode, true),getMonstreIDByTR(this.parentNode));},true);
		td.setAttribute('onmouseover', "this.style.cursor = 'pointer'; this.className = 'mh_tdtitre'");
		td.setAttribute('onmouseout', "this.className = 'mh_tdpage';");
		td.setAttribute('style', "font-weight:bold; text-align:center;");
		if (isCDMsRetrieved)
			td.innerHTML = listeLevels[i];
	}
}

// GESTION TROLLS

function getTrollPosition(i) {
	var tds = x_trolls[i].childNodes;
	var j = tds.length;
	return new Array(tds[j - 3].firstChild.nodeValue, tds[j - 2].firstChild.nodeValue, tds[j - 1].firstChild.nodeValue);
}

function getTrollID(i) {
	return x_trolls[i].childNodes[1].firstChild.nodeValue;
}

// Function getTrollGuildeID() has been removed from MZ original code for ZZ Fusion


function getTrollDistance(i) {
	return x_trolls[i].firstChild.firstChild.nodeValue;
}

function filtreTrolls() {
	var noIntangibles = setCheckBoxCookie(checkBoxIntangibles, "NOINT");
	var filtreT = filtreTroll != "";
	var filtreG = filtreGuilde != "";
	totaltab[6].firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild.firstChild.
				firstChild.firstChild.nodeValue = "TROLLS" + (filtreT ? " (filtrés sur " + filtreTroll + ")" : "")
				+ (filtreG ? " (guildes filtrées sur " + filtreGuilde + ")" : "");

	for (var i = nbTrolls+1; --i >= 3;) {
		var tds = x_trolls[i].childNodes;
		x_trolls[i].style.display = (noIntangibles && tds[2].firstChild.className == 'mh_trolls_0')
				|| (filtreT && tds[2].firstChild.firstChild.nodeValue.toLowerCase().indexOf(filtreTroll) == -1)
				|| (filtreG && (!tds[5].firstChild.firstChild || tds[5].firstChild.firstChild.nodeValue.toLowerCase().indexOf(filtreGuilde) == -1))
				? 'none' : '';
	}
}

// Function refreshDiplo() has been removed from MZ original code for ZZ Fusion


// Function putRealDiplo() has been removed from MZ original code for ZZ Fusion


function initPXTroll() {
	bulle = document.createElement('div');
	bulle.setAttribute('id', 'bulle');
	bulle.setAttribute('class', 'mh_textbox');
	bulle.setAttribute('style', 'position: absolute; border: 1px solid #000000; visibility: hidden;' +
			'display: inline; z-index: 2;');
	document.body.appendChild(bulle);

	for (var i = nbTrolls+1; --i >= 3;) {
		var niv = x_trolls[i].childNodes[3];
		niv.addEventListener("mouseover", showPXTroll,true);
		niv.addEventListener("mouseout", hidePXTroll,true);
	}
}

function showPXTroll(evt) {
	var lvl = this.firstChild.nodeValue;
	bulle.innerHTML = 'Niveau ' + lvl + analysePXTroll(lvl);
	bulle.style.left = evt.pageX + 15 + 'px';
	bulle.style.top = evt.pageY + 'px';
	bulle.style.visibility = "visible";
}

function hidePXTroll() {
	bulle.style.visibility = "hidden";
}

// GESTION TRESORS

function getTresorNom(i) {
	var nom = x_tresors[i].childNodes[2].firstChild.childNodes;
	return nom.length == 1 ? nom[0].nodeValue : nom[1].firstChild.nodeValue;
}

function getTresorPosition(i) {
	var tds = x_tresors[i].childNodes;
	return new Array(tds[3].firstChild.nodeValue, tds[4].firstChild.nodeValue, tds[5].firstChild.nodeValue);
}

function getTresorDistance(i) {
	return x_tresors[i].firstChild.firstChild.nodeValue;
}

function filtreTresors() {
	var noGG = setCheckBoxCookie(checkBoxGG, "NOGG");
	var noCompos = setCheckBoxCookie(checkBoxCompos, "NOCOMP");
	var noBidouilles = setCheckBoxCookie(checkBoxBidouilles, "NOBID");
	var filtre = filtreTresor != "";
	var noEngages = setCheckBoxCookie(checkBoxTresorsNonLibres, "NOTRESORSNONLIBRES");
	if (noEngages && !isEngagesComputed) {
		for (var i = nbTrolls+1; --i >= 3;) 
		{	
			var pos = getTrollPosition(i);
			if (!listeEngages[pos[0]])
				listeEngages[pos[0]] = new Array();
			if (!listeEngages[pos[0]][pos[1]])
				listeEngages[pos[0]][pos[1]] = new Array();
			listeEngages[pos[0]][pos[1]][pos[2]] = 1;
		}
		isEngagesComputed = true;
	}
	totaltab[nbTabSup+8].firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild.firstChild.
				firstChild.firstChild.nodeValue = "TRESORS" + (filtre ? " (filtrés sur " + filtreTresor + ")" : "");
	for (var i = nbTresors+1; --i >= 3;) {
		var nom = getTresorNom(i);
		var pos = getTresorPosition(i);
		x_tresors[i].style.display = (noGG && nom.indexOf("Gigots de Gob") != -1)
				|| (noCompos && nom.indexOf(" Composant") != -1)
				|| (noEngages && listeEngages[pos[0]] && listeEngages[pos[0]][pos[1]] && listeEngages[pos[0]][pos[1]][pos[2]] && getTresorDistance(i)>0)
				|| (filtre && nom.toLowerCase().indexOf(filtreTresor) == -1)
				|| (noBidouilles && nom.indexOf("[Bidouille] ") != -1)
			? 'none' : '';
	}
}

// GESTION LIEUX

function getLieuNom(i) {
	var nom = x_lieux[i].childNodes[2].childNodes[1].firstChild;
	return nom.nodeName != 'A' ? nom.nodeValue : nom.firstChild.nodeValue;
}

function getDistanceLieu(i) {
	return x_lieux[i].childNodes[0].childNodes[0].nodeValue * 1;
}

function filtreLieux() {
	var noTrou = setCheckBoxCookie(checkBoxTrou, "NOTROU");
	var filtre = filtreLieu != "";
	totaltab[nbTabSup+12].firstChild.firstChild.firstChild.childNodes[1].firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.
			nodeValue = "LIEUX PARTICULIERS" + (filtre ? " (filtrés sur " + filtreLieu + ")" : "");
	for (var i = nbLieux+1; --i >= 3;)
		x_lieux[i].style.display = ((filtre && getLieuNom(i).toLowerCase().indexOf(filtreLieu) == -1) 
			|| (noTrou && getLieuNom(i).toLowerCase().indexOf("trou de météorite") != -1 && getDistanceLieu(i) > 1))
			? 'none' : '';
}

// AJOUT BOUTONS

function putExternalLinks() {
	var cookie = MZ_getValue("URL1");
	if (cookie && cookie != "") {
		var myDivi = document.createElement('DIV');
		myDivi.setAttribute('align', 'LEFT');
		myDivi.appendChild(document.createElement('A'));
		myDivi.firstChild.setAttribute('href', cookie);
		myDivi.firstChild.setAttribute('target', '_blank');
		myDivi.firstChild.setAttribute('CLASS', 'AllLinks');
		appendText(myDivi.firstChild, "[" + MZ_getValue("NOM1") + "]");

		cookie = MZ_getValue("URL2");
		if (cookie && cookie != "") {
			myDivi.appendChild(document.createElement('A'));
			myDivi.childNodes[1].setAttribute('href', cookie);
			myDivi.childNodes[1].setAttribute('target', '_blank');
			myDivi.childNodes[1].setAttribute('CLASS', 'AllLinks');
			appendText(myDivi.childNodes[1], "[" + MZ_getValue("NOM2") + "]");

			cookie = MZ_getValue("URL3");
			if (cookie && cookie != "") {
				myDivi.appendChild(document.createElement('A'));
				myDivi.childNodes[2].setAttribute('href', cookie);
				myDivi.childNodes[2].setAttribute('target', '_blank');
				myDivi.childNodes[2].setAttribute('CLASS', 'AllLinks');
				appendText(myDivi.childNodes[2], "[" + MZ_getValue("NOM3") + "]");
			}
		}
		insertBefore(document.getElementsByTagName('div')[1], myDivi);
	}
}

function appendVue2DBouton(url, id, vue, texte, listeParams) {
	var myForm = document.createElement('form');
	myForm.setAttribute('method', 'post');
	myForm.setAttribute('action', url);
	myForm.setAttribute('target', '_blank');
	appendHidden(myForm, id, '');
	for (var i = 0; i < listeParams.length; i += 2)
		appendHidden(myForm, listeParams[i], listeParams[i + 1]);
	appendSubmit(myForm, texte, function() {document.getElementsByName(id)[0].value = vue();});

	var arr = document.getElementsByTagName('a');
	appendBr(arr[7].parentNode);
	arr[7].parentNode.appendChild(myForm);
}

// Le bouton pour la vue 2d
function putVue2DBouton() {
	var vueext = MZ_getValue("VUEEXT");
	if (vueext == "" || vueext == null || vueext == "grouky")
		appendVue2DBouton('http://ythogtha.org/MH/grouky.py/grouky', 'vue', getVueScript,
					   'La grouky vue !', new Array('type_vue', 'V4'));
	else if (vueext == "otan")
		appendVue2DBouton('http://drunk.cryo.free.fr/resultat_vue.php', 'txtVue', getVueScript,
					   'La vue OTAN', new Array('txtTypeVue', 'Mountyzilla'));
	else if (vueext == "ccm")
		appendVue2DBouton('http://clancentremonde.free.fr/Vue2/RecupVue.php', 'vue', getVueScript,
					   'La vue du CCM', new Array('id', numTroll + ";" + getPositionStr(getPosition())));
	else if (vueext == "relaismago")
		appendVue2DBouton('http://outils.relaismago.com/vue2d/get_vue.php3', 'datas', getLieux,
					   'Vue R&M', '');
	else if (vueext == "xtrolls")
		appendVue2DBouton('http://thextrolls.free.fr/carte/partage/vue_mozilla.php', 'vue',
					   getVueScript, 'La vue Xtrolls', new Array());
	else if (vueext == "lxgt")
		appendVue2DBouton('http://fryrd.free.fr/troll/forum/majvuemh.php', 'vue', getVueScript,
					   'La vue LXGT', new Array());
	else if (vueext == "garush")
		appendVue2DBouton('http://garush.free.fr/TrtVueScript.php', 'Vue', getVueScript, 'Vue Garush',
					   new Array());
	else if (vueext == "gloumfs2d")
		appendVue2DBouton('http://gloumf.free.fr/vue2d.php', 'vue_mountyzilla', getVueScript,
					   'La vue Gloumfs 2D', new Array());
	else if (vueext == "gloumfs3d")
		appendVue2DBouton('http://gloumf.free.fr/vue3d.php', 'vue_mountyzilla', getVueScript,
					   'La vue Gloumfs 3D', new Array());
	else if (vueext == "bricol")
		appendVue2DBouton('http://trolls.ratibus.net/mountyhall/vue_form.php', 'vue', getVueScript,
					   'La Bricol\' Vue', new Array('mode', 'vue_SP_Vue2', 'screen_width', screen.width));
	else if (vueext == "kilamo")
		appendVue2DBouton('http://zadorateursdekilamo.free.fr/public/pub_chrgvue.php', 'VUEMH',
					   getVueScript, 'La vue KiLaMo', new Array());
	else if (vueext == "evo")
		appendVue2DBouton('http://www.evolution-mountyhall.com/fr/spe/evo/evo_v2d_mz.php', 'vue',
					   getVueScript, 'La Vue Evolution', new Array('action', 'generer'));
}

function insertBouton(next, url, id, value, text) {
	var myForm = document.createElement('form');
	myForm.setAttribute('method', 'post');
	myForm.setAttribute('align', 'right');
	myForm.setAttribute('action', url);
	myForm.setAttribute('name', 'frmvue');
	myForm.setAttribute('target', '_blank');
	appendHidden(myForm, id, '');
	appendSubmit(myForm, text, function() {document.getElementsByName(id)[0].value=value();});
	next.parentNode.insertBefore(myForm, next);
}

function putMonstresBouton() {
	insertBouton (totaltab[4], 'http://mountyhall.clubs.resel.fr/script/v2/get_monstres.php',
			'listemonstres', getMonstres, 'Ajouter les monstres à la base des Teubreux');
}

function putLieuxBouton() {
	insertBouton(totaltab[12], 'http://mountyzilla.tilk.info/scripts/lieux.php',
			'listelieux', getLieux, 'Ajouter les lieux à la base');
}

function putFiltresBoutons() {
	var thead = document.createElement('thead');
	totaltab[3].removeChild(totaltab[3].firstChild);
	insertBefore(totaltab[3].firstChild, thead);
	var tr = appendTr(thead, 'mh_tdtitre');
	tr.addEventListener("click", function() {toggleTableau(3);},true);
	var td = appendTdText(tr, "INFORMATIONS", true);

	td.setAttribute('colspan', '9');
	td.setAttribute('onmouseover', "this.style.cursor = 'pointer'; this.className = 'mh_tdpage';");
	td.setAttribute('onmouseout', "this.className='mh_tdtitre';");

	// On met le limitateur de vue à gauche pour des questions de taille de tableau
	var tr = totaltab[3].childNodes[1].firstChild;
	tr.setAttribute('class', 'mh_tdpage');
	td = tr.childNodes[1];
	tr.removeChild(td);
	tr.appendChild(td);
// TODO: *** de *** pourquoi il veut pas me center le TD de gauche ??
//	tr.firstChild.setAttribute('align', 'center');

	tr = insertTr(tr, 'mh_tdpage');
	td = appendTdText(tr, "EFFACER : ", true);
	td.setAttribute('align', 'right');
	td = appendTdCenter(tr);
	checkBoxGG = appendNobr(td, 'delgg', filtreTresors, ' Les GG\'').firstChild;
	checkBoxCompos = appendNobr(td, 'delcomp', filtreTresors, ' Les Compos').firstChild;
	checkBoxBidouilles = appendNobr(td, 'delbid', filtreTresors, ' Les Bidouilles').firstChild;
	checkBoxIntangibles = appendNobr(td, 'delint', filtreTrolls, ' Les Intangibles').firstChild;
	checkBoxGowaps = appendNobr(td, 'delgowap', filtreMonstres, ' Les Gowaps').firstChild;
	checkBoxEngages = appendNobr(td, 'delengage', filtreMonstres, ' Les Engagés').firstChild;
	checkBoxLevels = appendNobr(td, 'delniveau', filtreLevels, ' Les Niveaux').firstChild;
	checkBoxDiplo = appendNobr(td, 'deldiplo', refreshDiplo, ' La Diplo').firstChild;
	checkBoxTrou = appendNobr(td, 'deltrou', filtreLieux, ' Les Trous').firstChild;
	checkBoxMythiques = appendNobr(td, 'delmyth', filtreMonstres, ' Les Mythiques').firstChild;
	if(MZ_getValue("NOINFOEM") != "true")
		checkBoxEM = appendNobr(td, 'delem', filtreMonstres, ' Les Composants EM').firstChild;
	checkBoxTresorsNonLibres = appendNobr(td, 'deltres', filtreTresors, ' Les Trésors non libres').firstChild;
	checkBoxTactique = appendNobr(td, 'deltactique', updateTactique, ' Les Infos tactiques').firstChild;
	
	if(MZ_getValue("INFOPLIE"))
	{
		try
		{
			toggleTableau(3);
		}
		catch(e)
		{
			alert(e);
		}
	}
}

function appendSearch(td, text, buttonValue, buttonOnClick) {
	var nobr = document.createElement('NOBR');
	var textbox = appendTextbox(nobr, 'text', text, '12', '20');
	appendText(nobr, "\u00a0");
	var button=appendButton(nobr, buttonValue, buttonOnClick);
	textbox.addEventListener("keypress",function(event){try{if(event.keyCode == 13) {event.preventDefault();button.click();}}catch(e){alert(e)}}, true);
	td.appendChild(nobr);
	appendText(td, "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 ");
}

function appendComboSearch(td, text, comboName, comboOnChange) {
	var nobr = document.createElement('NOBR');
	appendText(nobr, "\u00a0"+text);
	appendText(nobr, "\u00a0");
	var select = document.createElement('SELECT');
	select.setAttribute('name', comboName);
	select.addEventListener("change",comboOnChange, true);
	var option = document.createElement('OPTION');
	option.setAttribute("value",0);
	appendText(option, "Aucun");
	select.appendChild(option);
	for(var i=1;i<=50;i++)
	{
		option = document.createElement('OPTION');
		option.setAttribute("value",i);
		appendText(option, i);
		select.appendChild(option);
	}
	nobr.appendChild(select);
	td.appendChild(nobr);
	appendText(td, "\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0\u00a0 ");
	return select;
}

function putSearchForms() {
	var tr = insertTr(totaltab[3].childNodes[1].childNodes[1], 'mh_tdpage');
	var td = appendTdText(tr, "RECHERCHER :", true);
	td.setAttribute('align', 'right');
	td = appendTdCenter(tr);
	appendSearch(td, 'rec_monstre', 'Monstre', function() {filtreMonstre = document.getElementById("rec_monstre").value.toLowerCase(); filtreMonstres();});
	appendSearch(td, 'rec_troll', 'Trõll', function() {filtreTroll = document.getElementById("rec_troll").value.toLowerCase(); filtreTrolls();});
	appendSearch(td, 'rec_guilde', 'Guilde', function() {filtreGuilde = document.getElementById("rec_guilde").value.toLowerCase(); filtreTrolls();});
	appendSearch(td, 'rec_tresor', 'Trésor', function() {filtreTresor = document.getElementById("rec_tresor").value.toLowerCase(); filtreTresors();});
	appendSearch(td, 'rec_lieu', 'Lieu', function() {filtreLieu = document.getElementById("rec_lieu").value.toLowerCase(); filtreLieux();});
	tr = insertTr(totaltab[3].childNodes[1].childNodes[1], 'mh_tdpage');
	td = appendTdText(tr, "FILTRAGE MONSTRES :", true);
	td.setAttribute('align', 'right');
	td = appendTdCenter(tr);
	comboBoxNiveauMin=appendComboSearch(td, 'Niveau min :', 'rec_niveau_monstre_min', filtreMonstres);
	comboBoxNiveauMax=appendComboSearch(td, 'Niveau max :', 'rec_niveau_monstre_max', filtreMonstres);
}

// SCRIPTS

function getPosition() {
	var pos = document.evaluate("//li/b/text()[contains(.,'X = ')]",
				document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.nodeValue;
	var posx = pos.substring(pos.indexOf('=') + 2, pos.indexOf(','));
	pos = pos.substr(pos.indexOf(',') + 1);
	var posy = pos.substring(pos.indexOf('=') + 2, pos.indexOf(',')); var posn = pos.substr(pos.lastIndexOf('=') + 2); if (posn.indexOf('[')>0) posn=posn.substr(0, posn.indexOf('[')-1); return new Array(posx, posy, posn);
}

function getPorteVue() {
	var array=new Array();
	var nodes = document.evaluate("//li/b/text()[contains(.,'horizontalement') or contains(.,'verticalement')]", document, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	if(nodes.snapshotLength!=4)
		return null;
	for(var i=0;i<4;i++)
	{
		array.push(parseInt(nodes.snapshotItem(i).nodeValue));
	}
	return array;
}

function getPositionStr(pos) {
	return pos[0] + ";" + pos[1] + ";" + pos[2];
}

function getVue() {
	var vues = getPorteVue();
	return new Array(vues[0], vues[1]);
}

function appendMonstres(txt) {
	for (var i = 3; i <= nbMonstres; i++)
		txt += getMonstreID(i) + ";" + getMonstreNom(i) + ";" + getPositionStr(getMonstrePosition(i)) + "\n";
	return txt;
}

function getMonstres() {
	var vue = getVue();
	return appendMonstres(getPositionStr(getPosition()) + ";" + vue[0] + ";" + vue[1] + "\n");
}

function appendLieux(txt) {
	for (var i = 3; i < nbLieux+1; i++) {
		var tds = x_lieux[i].childNodes;
		txt += tds[1].firstChild.nodeValue + ";" + getLieuNom(i) + ";" + tds[3].firstChild.nodeValue + ";"
				+ tds[4].firstChild.nodeValue + ";" + tds[5].firstChild.nodeValue + "\n";
	}
	return txt;
}

function getLieux() {
	var vue = getVue();
	return appendLieux(getPositionStr(getPosition()) + ";" + vue[0] + ";" + vue[1] + "\n");
}

function getVueScript() 
{
	try
	{
	txt = "#DEBUT TROLLS\n" + numTroll + ";" + getPositionStr(getPosition()) + "\n";
	for (var i = 3; i < nbTrolls+1; i++)
		txt += getTrollID(i) + ";" + getPositionStr(getTrollPosition(i)) + "\n";
	txt = appendMonstres(txt + "#FIN TROLLS\n#DEBUT MONSTRES\n") + "#FIN MONSTRES\n#DEBUT TRESORS\n";
	for (var i = 3; i < nbTresors+1; i++) {
		var tds = x_tresors[i].childNodes;
		txt += tds[1].firstChild.nodeValue + ";" + getTresorNom(i) + ";" + tds[3].firstChild.nodeValue + ";"
				+ tds[4].firstChild.nodeValue + ";" + tds[5].firstChild.nodeValue + "\n";
	}
	txt = appendLieux(txt + "#FIN TRESORS\n#DEBUT LIEUX\n") + "#FIN LIEUX\n#DEBUT CHAMPIGNONS\n";
	for (var i = 3; i < nbChampis+1; i++) {
		var tds = x_champis[i].childNodes;
		txt += tds[1].firstChild.nodeValue + ";" + tds[2].firstChild.nodeValue + ";" + tds[3].firstChild.nodeValue
				+ ";" + tds[4].firstChild.nodeValue + "\n";
	}
	return txt + "#FIN CHAMPIGNONS\n#DEBUT ORIGINE\n" + getVue()[0] + ";" + getPositionStr(getPosition()) + "\n#FIN ORIGINE\n";
	}
	catch(e) { alert(e)}
}

function putScriptExterne() {
	var infoit = MZ_getValue("IT_" + numTroll);
	if (!infoit || infoit == "")
		return;
	var it = infoit.substring(0, infoit.indexOf('$'));
	if (it == "ssgg")
		appendNewScript('http://zarh.homeip.net/ssgg/mz_ssgg.php?id_troll=' + numTroll
				+ '&password=' + infoit.substr(infoit.indexOf('$') + 1));
	else if (it == "bricol") {
		var t = infoit.split('$');
		appendNewScript('http://trolls.ratibus.net/' + t[1] + '/mz.php?login=' + t[2] + '&password=' + t[3]);
	}
}

function erreur( chaine )
{
  var infoit = MZ_getValue("IT_" + numTroll);
  if (!infoit || infoit == "")
		return;
  var it = infoit.substring(0, infoit.indexOf('$'));
  if(it=="ssgg")
    alert("Erreur lors de la connection avec le SSGG :\n"+chaine);
  else if(it=="bricol")
    alert("Erreur lors de la connection avec l'interface des bricol'Trolls :\n"+chaine);
  MZ_removeValue("IT_"+numTroll);
}

function putInfosTrolls() {
try
{
	var i;
	for (i = 3; i < nbTrolls+1; i++)
		if (infosTrolls[getTrollID(i)])
			break;
	if (i == nbTrolls+1)
		return;

	var td = insertTdText(x_trolls[2].childNodes[6], 'PV', true);
	td.setAttribute('width', '105');
	td = insertTdText(x_trolls[2].childNodes[7], 'PA', true);
	td.setAttribute('width', '40');

	for (i = 3; i < nbTrolls+1; i++) {
		var infos = infosTrolls[getTrollID(i)];
		if (infos) {
			var tab = document.createElement('div');
			tab.setAttribute('width', '100');
			//tab.setAttribute('border', '0');
			//tab.setAttribute('cellspacing', '1');
			//tab.setAttribute('cellpadding', '0');
			//tab.setAttribute('bgcolor', '#000000');
			tab.style.background='#FFFFFF';
			tab.style.width=100;
			tab.style.border=1;
			tab.setAttribute('height', '10');
			var img = document.createElement('img');
			img.setAttribute('src', '../Images/Interface/milieu.gif');
			img.setAttribute('height', '10');
			img.setAttribute('width', Math.floor((100 * infos[0]) / infos[1]));
			tab.setAttribute('title', infos[0] + '/' + infos[1] + ' ' + infos[2]);
			tab.appendChild(img);
			insertTdElement(x_trolls[i].childNodes[6], tab);
			//insertTdElement(x_trolls[i].childNodes[6], img);
			var span = document.createElement('span');
			insertTdElement(x_trolls[i].childNodes[7], span);
			span.setAttribute('title', infos[3]);
			appendText(span, infos[4] + " PA");
		} else {
			insertTdElement(x_trolls[i].childNodes[6]);
			insertTdElement(x_trolls[i].childNodes[7]);
		}
	}
}
catch(e)
{
  alert(e+" "+i+"\n"+x_trolls[i].innerHTML);
}
}

// POPUP CDM

function getCDM(nom, id) {
	if (listeCDM[id]) {
		if (!document.getElementById("popupCDM" + id))
			afficherCDM(nom, id);
		else
			cacherPopupCDM("popupCDM" + id);
	}
}

function initPopup() {
	popup = document.createElement('div');
	popup.setAttribute('id', 'popup');
	popup.setAttribute('class', 'mh_textbox');
	popup.setAttribute('style', 'position: absolute; border: 1px solid #000000; visibility: hidden;' +
			'display: inline; z-index: 3; max-width: 500px;');
	document.body.appendChild(popup);
}

function showPopup(evt) {
	var texte = this.getAttribute("texteinfo");
	popup.innerHTML = texte;
	popup.style.left = evt.pageX + 15 + 'px';
	popup.style.top = evt.pageY + 'px';
	popup.style.visibility = "visible";
}

function showPopup2(evt) {
	var id = this.getAttribute("id");
	var nom = this.getAttribute("nom");
	var texte = getAnalyseTactique(id,nom);
	if(texte=="")
		return;
	popup.innerHTML = texte;
	popup.style.left = Math.min(evt.pageX + 15,window.innerWidth-400) + 'px';
	popup.style.top = evt.pageY+15 + 'px';
	popup.style.visibility = "visible";
}

function hidePopup() {
	popup.style.visibility = "hidden";
}

function createPopupImage(url, text)
{
	var img = document.createElement('img');
	img.setAttribute('src',url);
	img.setAttribute('align','ABSMIDDLE');
	img.setAttribute("texteinfo",text);
	img.addEventListener("mouseover", showPopup,true);
	img.addEventListener("mouseout", hidePopup,true);
	return img;
}

function createPopupImage2(url, id, nom)
{
	var img = document.createElement('img');
	img.setAttribute('src',url);
	img.setAttribute('align','ABSMIDDLE');
	img.setAttribute("id",id);
	img.setAttribute("nom",nom);
	img.addEventListener("mouseover", showPopup2,true);
	img.addEventListener("mouseout", hidePopup,true);
	return img;
}

function recomputeTypeTrolls()
{
	for (var i = 0; i < listeTags; i++) 
	{
		computeTypeTrolls(listeTags[i],listeTagsInfos[i]);
	}
	for (var i = 0; i < listeTagsGuilde; i++) 
	{
		computeTypeGuildes(listeTagsGuilde[i],listeTagsInfosGuilde[i]);
	}
}

function setAllTags(infoTrolls,infoGuildes)
{
	for (var i = 3; i < nbTrolls+1; i++) 
	{
		var infos = infoGuildes[getTrollGuildeID(i)];
		if (infos) 
		{
			var tr = document.evaluate("td/a[contains(@href,'EAV')]/..",
			x_trolls[i], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
		infos = infoTrolls[getTrollID(i)];
		if (infos) 
		{
			var tr = document.evaluate("td/a[contains(@href,'EPV')]/..",
			x_trolls[i], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
	}
}

function analyseTagFile(data)
{
	var icones = new Array();
	var descriptions = new Array();
	var infoTrolls = new Array();
	var infoGuildes = new Array();
	
	var lignes = data.split("\n");
	for(var i=0;i<lignes.length;i++)
	{
		try
		{
			var data = lignes[i].split(";");
			if(data.length<=1)
				continue;
			if(data[0]=="I")
			{
				icones.push(lignes[i].substring(lignes[i].indexOf(";")+1));
			}
			else if(data[0]=="D")
			{
				descriptions.push(bbcode(lignes[i].substring(lignes[i].indexOf(";")+1)));
			}
			else if(data[0]=="T")
			{
				if(data.length<=2)
				continue;
				var id = data[1]*1;
				var icone = icones[data[2]*1];
				var texte = "";
				for(var j=3;j<data.length;j++)
					texte+=descriptions[data[j]*1];
				var info = new Array(icone,texte);
				if(infoTrolls[id] == null)
					infoTrolls[id] = new Array();
				infoTrolls[id].push(info);
			}
			else if(data[0]=="G")
			{
				if(data.length<=2)
					continue;
				var id = data[1]*1;
				var icone = icones[data[2]*1];
				var texte = "";
				for(var j=3;j<data.length;j++)
					texte+=descriptions[data[j]*1];
				var info = new Array(icone,texte);
				if(infoGuildes[id] == null)
					infoGuildes[id] = new Array();
				infoGuildes[id].push(info);
			}
		}
		catch(e)
		{
			alert(e);
			break;
		}
	}
	if(infoGuildes.length!=0 || infoTrolls.length!=0)
		setAllTags(infoTrolls,infoGuildes);
}

function computeTag()
{
	try
	{
	initPopup();
	if(MZ_getValue("TAGSURL") == null || MZ_getValue("TAGSURL")=="")
		return false;
	var tagsurl = MZ_getValue("TAGSURL");
	var listeTagsURL = tagsurl.split("$");
	for(var i=0;i<listeTagsURL.length;i++)
	{
		if(listeTagsURL[i].toLowerCase().indexOf("http")==0)
		{
			//appendNewScript(listeTagsURL[i]);
			MZ_xmlhttpRequest({
			    method: 'GET',
			    url: listeTagsURL[i],
			    headers: {
			        'User-agent': 'Mozilla/4.0 [FusionZoryaZilla] (compatible) Mountyzilla',
			        'Accept': 'application/xml,text/xml',
			    },
			    onload: function(responseDetails) {
					try
					{
						analyseTagFile(responseDetails.responseText);
					}
					catch(e)
					{
						alert(e);
					}
				}
			});
		}
	}
	}
	catch(e) {alert(e);}
}

function computeTelek()
{
	if(getSortComp("Télékinésie")==0)
		return false;
	var urlImg = SkinZZ+"MZ/Sorts/telekinesie.png";
	var trolln = getPosition()[2];
	for (var i = nbTresors+1; --i >= 3;) {
		var pos = getTresorPosition(i);
		if(pos[2]==trolln)
		{
			var tr = x_tresors[i].childNodes[2];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImg, "Trésor transportable par Télékinésie"));
		}	
	}
}

function getPortee(param) {
	return Math.ceil((Math.sqrt(19 + 8 * (param + 3)) - 7) / 2);
}

function computeChargeProjo()
{
	var urlImgCharge = SkinZZ+"MZ/Competences/charger.png";
	var urlImgProjo = SkinZZ+"MZ/Sorts/projectileMagique.png";
	var trolln = getPosition()[2];
	if(!computeChargeProjoMonstre())
		return false;
	var charger = getSortComp("Charger")!=0;
	var projo = getSortComp("Projectile Magique")!=0;
	if(!charger && !projo)
	{
		return false;
	}
	var porteeCharge = -1;
	var porteeProjo = -1;
	if(charger)
	{
		var aux = Math.ceil(MZ_getValue(numTroll+".caracs.pv") / 10) + MZ_getValue(numTroll+".caracs.regeneration");
		porteeCharge = getPortee(aux);
	}
	if(projo)
	{
		porteeProjo = getPortee(MZ_getValue(numTroll+".caracs.vue.bm")+MZ_getValue(numTroll+".caracs.vue"));
	}
	for (var i = 3; i < nbTrolls+1; i++) 
	{
		var id = getTrollID(i);
		var pos = getTrollPosition(i);
		var dist = getTrollDistance(i);
		if(dist>0 && pos[2] == trolln && dist<=porteeCharge)
		{
			var tr = x_trolls[i].childNodes[2];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgCharge, "Accessible en charge"));
		}
		if(pos[2] == trolln && dist<=porteeProjo)
		{
			var tr = x_trolls[i].childNodes[2];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgProjo, "Touchable avec un projectile magique"));
		}

	}
}

function computeChargeProjoMonstre()
{
	var urlImgCharge = SkinZZ+"MZ/Competences/charger.png";
	var urlImgProjo = SkinZZ+"MZ/Sorts/projectileMagique.png";
	var charger = getSortComp("Charger")!=0;
	var projo = getSortComp("Projectile Magique")!=0;
	var trolln = getPosition()[2];
	if(!charger && !projo)
	{
		return false;
	}
	var porteeCharge = -1;
	var porteeProjo = -1;
	if(charger)
	{
		var aux = Math.ceil(MZ_getValue(numTroll+".caracs.pv") / 10) + MZ_getValue(numTroll+".caracs.regeneration");
		porteeCharge = getPortee(aux);
	}
	if(projo)
	{
		porteeProjo = getPortee(MZ_getValue(numTroll+".caracs.vue.bm")+MZ_getValue(numTroll+".caracs.vue"));
	}
	
	var urlImg = SkinZZ+"MZ/oeil.png";
	for (var i = nbMonstres+1; --i >= 3;) 
	{
		var id = getMonstreID(i);
		var pos = getMonstrePosition(i);
		var dist = getMonstreDistance(i);
		if(dist>0 && pos[2] == trolln && dist<=porteeCharge)
		{
			var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgCharge, "Accessible en charge"));
		}
		if(pos[2] == trolln && dist<=porteeProjo)
		{
			var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createImage(urlImgProjo, "Touchable avec un projectile magique"));
		}
	}
	return true;
}

function computeTactique(begin, end)
{
	try
	{
	var j;
	if(begin==null)
		begin=3;
	if(end==null)
		end=nbMonstres;
	var noTactique = setCheckBoxCookie(checkBoxTactique, "NOTACTIQUE");
	if(noTactique || !isProfilActif())
		return;
	for (j = end; j>=begin;j--)
	{
		var id = getMonstreID(j);
		var donneesMonstre = listeCDM[id];
		var nom = getMonstreNom(j);

		if(donneesMonstre && nom.indexOf("Gowap Apprivoisé")==-1 && nom.indexOf("Gowap Sauvage") == -1)
		{
			var imgUrl = SkinZZ+"MZ/calc2.png";
			var tr = x_monstres[j].childNodes[checkBoxLevels.checked ? 2 : 3];
			tr.appendChild(document.createTextNode(" "));
			tr.appendChild(createPopupImage2(imgUrl, id, nom));
		}
	}
	}catch(e){alert(j+" "+e)}
	filtreMonstres();
}

function computeVLC(begin,end)
{
	computeTactique(begin,end);
	if(begin==null)
		begin=3;
	if(end==null)
		end=nbMonstres;
	var cache =true; // (ZZ: le caché peut servir pour les autres) var cache = getSortComp("Invisibilité")>0 || getSortComp("Camouflage")>0;
	if(!cache)
		return false;
	var urlImg = SkinZZ+"MZ/oeil.png";
	for (var i = end; i >= begin;i--)
	{
		var id = getMonstreID(i);
		var donneesMonstre = listeCDM[id];
		if(donneesMonstre && donneesMonstre.length>13)		
      {
         if(donneesMonstre[13]==1)
         {
            var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
            tr.appendChild(document.createTextNode(" "));
            tr.appendChild(createImage(SkinZZ+"distance.png", "Attaque à distance"));
         }
		 }
		 if(donneesMonstre && donneesMonstre.length>12)
		{
			if(donneesMonstre[12]==1)
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createImage(urlImg, "Voit le caché"));
			}
		}
	}
}


function computeMission(begin,end)
{
	computeVLC(begin,end);
	if(begin==null)
		begin=3;
	if(end==null)
		end=nbMonstres;
	if(!MZ_getValue("MISSION_"+numTroll) || MZ_getValue("MISSION_"+numTroll)=="")
		return false;
	var urlImg = SkinZZ+"MZ/mission.png";
	var cookie = MZ_getValue("MISSION_"+numTroll);
	var infosMission = cookie.split("$");
	for (var i = end; i >= begin;i--)
	{
		var id = getMonstreID(i);
		var nom = getMonstreNom(i).toLowerCase();
		if(infosMission[0]=="R")
		{
			if(epure(nom).indexOf(epure(infosMission[2].toLowerCase()))!=-1)
			{
				var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createImage(urlImg, infosMission[4]));
			}
		}
		else if(infosMission[0]=="N")
		{
			var donneesMonstre = listeCDM[id];
			if(donneesMonstre)
			{
				if(donneesMonstre[0]*1>=infosMission[2]*1-1 && donneesMonstre[0]*1<=infosMission[2]*1+1)
				{
					var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
					tr.appendChild(document.createTextNode(" "));
					tr.appendChild(createImage(urlImg, infosMission[4]));
				}
			}
		}
		else if(infosMission[0]=="F")
		{
			var donneesMonstre = listeCDM[id];
			if(donneesMonstre)
			{
				if(epure(donneesMonstre[1]).toLowerCase().indexOf(epure(infosMission[2].toLowerCase()))!=-1)
				{
					var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
					tr.appendChild(document.createTextNode(" "));
					tr.appendChild(createImage(urlImg, infosMission[4]));
				}
			}
		}
		else if(infosMission[0]=="P")
		{
			var donneesMonstre = listeCDM[id];
			if(donneesMonstre)
			{
				if(epure(donneesMonstre[10]).toLowerCase().indexOf(epure(infosMission[2].toLowerCase())+" =>")!=-1)
				{
					var tr = x_monstres[i].childNodes[checkBoxLevels.checked ? 2 : 3];
					tr.appendChild(document.createTextNode(" "));
					tr.appendChild(createImage(urlImg, infosMission[4]));
				}
			}
		}
	}
}

function afficherCDM(nom, id) {
	var donneesMonstre = listeCDM[id];
	var table = createCDMTable(id,nom,donneesMonstre);
	table.setAttribute('id', "popupCDM" + id);
	table.setAttribute('style', 'display: none; position: fixed; z-index: 1; top: '+ (300
			+ (30 * nbCDM)) % (30 * Math.floor((window.innerHeight - 400) / 30)) + 'px; left: '
			+ (window.innerWidth - 365) + 'px; width: 300px; height: 200px;');
	totaltab[0].parentNode.appendChild(table);

	var tr = table.firstChild;
	tr.setAttribute('style', 'cursor:move;');
	tr.addEventListener("mousedown",startDrag,true);
//	tr.addEventListener("mousemove", drag, true);
	tr.addEventListener("mouseup", stopDrag, true);
	tr = appendTr(table.childNodes[1], 'mh_tdtitre');
	tr.setAttribute('onmouseover', "this.style.cursor = 'pointer'; this.className = 'mh_tdpage';");
	tr.setAttribute('onmouseout', "this.className = 'mh_tdtitre';");
	tr.setAttribute('cdmindex',id);
	tr.addEventListener("click", function() {id=this.getAttribute("cdmindex");cacherPopupCDM( 'popupCDM' + id); this.className = 'mh_tdtitre';},true);
	td = appendTdText(tr, 'Fermer', true);
	td.setAttribute('colspan', '2');
	td.setAttribute('style', 'text-align:center;');
	nbCDM++;
	table.style.display = '';
}

function demarque(nom)
{
   var indice = nom.indexOf("]");
   if(indice == -1)
      return nom;
   if(indice == nom.length-1)
      return nom;
   return nom.substring(0,indice+1);
}

var selectionFunction;

function startDrag(evt) {

	winCurr = this.parentNode;
	evt = evt || window.event;
	offsetX = evt.pageX - parseInt( winCurr.style.left );
	offsetY = evt.pageY - parseInt( winCurr.style.top );
	selectionFunction = document.body.style.MozUserSelect;
	document.body.style.MozUserSelect="none";
	winCurr.style.MozUserSelect="none";
	
	return false;
}

function stopDrag(evt) {
	winCurr.style.MozUserSelect=selectionFunction;
	document.body.style.MozUserSelect = selectionFunction;
	winCurr = null;
}

function drag(evt) {

	if (winCurr == null)
		return;
	evt = evt || window.event;
	winCurr.style.left = (evt.pageX - offsetX)+'px';
	winCurr.style.top = (evt.pageY - offsetY)+'px';
	return false;
}

function cacherPopupCDM(titre) {
	var popup = document.getElementById(titre);
	popup.parentNode.removeChild(popup);
}

// TABLES REPLIABLES

function creerTHead(num) {
	var tr = totaltab[num].childNodes[1].firstChild;
	tr.addEventListener("click", function() {toggleTableau(num);},true);
	var thead = document.createElement('thead');
	thead.appendChild(tr);
	var links=tr.getElementsByTagName('a');
	for(var i=1;i<links.length;i++)
	{
		links[i].setAttribute('onmouseover','cursorOnLink=true;');
        links[i].setAttribute('onmouseout','cursorOnLink=false;');
	}
	insertBefore(totaltab[num].firstChild, thead);
	tr.firstChild.setAttribute('colspan', '11');
	tr.setAttribute('onmouseover', "this.style.cursor = 'pointer'; this.className = 'mh_tdpage';");
	tr.setAttribute('onmouseout', "this.className = 'mh_tdtitre';");
}

// Function toggleTableau() has been removed from MZ original code for ZZ Fusion


function savePosition()
{
	var pos = getPosition();
	MZ_setValue(numTroll+".position.X",pos[0]);
	MZ_setValue(numTroll+".position.Y",pos[1]);
	MZ_setValue(numTroll+".position.N",pos[2]);
}

start_script(31);

for (var i = 4; i < 15; i += 2)
	creerTHead(i);
	

putFiltresBoutons();
putSearchForms();
putExternalLinks();
putVue2DBouton();
putLieuxBouton();
putMonstresBouton();


//800 ms
synchroniseFiltres();
filtreLevels();
if (!externalVue) savePosition();	  // pas de sauvegarde dans le cas des vues externes

//400 ms
{
	var noGG = setCheckBoxCookie(checkBoxGG, "NOGG");
	var noCompos = setCheckBoxCookie(checkBoxCompos, "NOCOMP");
	var noBidouilles = setCheckBoxCookie(checkBoxBidouilles, "NOBID");
	var noGowaps = setCheckBoxCookie(checkBoxGowaps, "NOGOWAP");
	var noMythiques = setCheckBoxCookie(checkBoxMythiques, "NOMYTH");
	var noEngages = setCheckBoxCookie(checkBoxEngages, "NOENGAGE");
	var noTresorsEngages = setCheckBoxCookie(checkBoxTresorsNonLibres, "NOTRESORSNONLIBRES");
	var noTrou = setCheckBoxCookie(checkBoxTrou, "NOTROU");
	var noIntangibles = setCheckBoxCookie(checkBoxIntangibles, "NOINT");
	filtreMonstres();
	if(noIntangibles)
		filtreTrolls();
	if(noGG || noCompos || noBidouilles || noTresorsEngages)
		filtreTresors();
	if(noTrou)
		filtreLieux();
}
//refreshDiplo();	  // Diplo faite par ZZ dans sa version Fusion
initPXTroll();
computeTag();
computeTelek();
computeChargeProjo();
putScriptExterne();

displayScriptTime();
//============================ ZZ POST CODE ======================================

//----------------------------------------------------------------------------------------------------
function ZZcompoEM(Monstre) {
     var compo="";
	for (var i=0; i<tabEM.length; i++) {
	 	if (tabEM[i][0].toLowerCase()==Monstre.toLowerCase()) {
	 	    if (tabEM[i][4]==1)
			    compo="<IMG SRC='"+SkinZZ+"smallEM_variable.gif'> Divers composants <b>"+tabEM[i][1]+" "+tabEM[i][0]+" </b>("+tabEM[i][2]+")";
  		    else
			    compo="<IMG SRC='"+SkinZZ+"smallEM_fixe.gif'> <b>"+tabEM[i][1]+" "+tabEM[i][0]+"</b> (Qualité "+tabQualite[tabEM[i][3]]+") pour l'écriture de <b>"+tabEM[i][2]+"</b>";
		}
	}
	return compo;     
}

function getMonstreDef(nom){
	for (var k = 0; k < tabMonstres.length; k++) {
		if (nom.indexOf(tabMonstres[k][0]+" ") != -1) {	
			return k;
		}
	}
	return -1;
}

//----------------------------------------------------------------------------------------------------
function createInsulteIMG(MeInsulte) {
		var myImg=document.createElement('img');
  		myImg.setAttribute('src',SkinZZ+'greenball.gif');
  		//if (ITM_HandiZilla=='oui') {
  		//	myImg.setAttribute('height','15');
	  	//	myImg.setAttribute('width','15');
	  	//} else {
	  		myImg.setAttribute('height','10');
	  		myImg.setAttribute('width','10');
		//}
  		var comment='Insulté par '+MeInsulte[1]+' [RM'+MeInsulte[2]+'] ('+MeInsulte[0]+')';
  		myImg.setAttribute('title',comment);
  		return myImg;
}
  
function createImageSize(url, w, h)
{
	var img = document.createElement('img');
	img.setAttribute('src',url);
	img.setAttribute('width', w);	
	img.setAttribute('height', h);
	return img;
}
  
function createBarrePV(color, pvr, pv, comment) { //color: 0=red, 1=gris
	if (pvr>pv) pvr=pv;
    var size=Math.floor((50*pvr)/pv); if ((size<50) && (size>48)) size=48;   // pour rendre plus joli
	if (comment=='') var text=pvr+'/'+pv+' PV';	else var text=comment;    

	if (color==0) var imgG='/skin/red.gif'; else if (color==1) var imgG='/skin/grey.gif'; else imgG='/skin/white.gif';
    if (color==-3) var imgD='/skin/green.gif';  else var imgD='/skin/white.gif'; 

	var myTableI=document.createElement('span');
	myTableI.setAttribute('title',text);
	myTableI.setAttribute('align','ABSMIDDLE');

	var img1 = createImageSize(ZZDB+'/skin/black.gif', 1, 10);
	myTableI.appendChild(img1);
	var img2 = createImageSize(ZZDB+imgG, size, 10);
	myTableI.appendChild(img2);		
	var img3 = createImageSize(ZZDB+'/skin/black.gif', 1, 10);
	myTableI.appendChild(img3);
	var img4 = createImageSize(ZZDB+imgD, 50-size, 10);
	myTableI.appendChild(img4);
	if (size<50) {
		var img5 = createImageSize(ZZDB+'/skin/black.gif', 1, 10);
		myTableI.appendChild(img5);
	}
	return myTableI;
}

function createTablePV(color, pvr, pv, comment) { //color: 0=red, 1=gris
		if (pvr>pv) pvr=pv;
        var size=Math.floor((50*pvr)/pv); if ((size<50) && (size>48)) size=48;   // pour rendre plus joli
		var myTable=document.createElement('table');
		myTable.setAttribute('width','50');
		myTable.setAttribute('border','0');
		myTable.setAttribute('cellspacing','1');
		myTable.setAttribute('cellpadding','0');
		myTable.setAttribute('bgcolor','#000000'); 
		var myTr=document.createElement('tr');
		myTable.appendChild(myTr);
		var myTd=document.createElement('td');
		if (color==0) myTd.setAttribute('bgcolor','#FF0000'); else if (color==1) myTd.setAttribute('bgcolor','#AAAAAA'); else myTd.setAttribute('bgcolor','#FFFFFF');
		myTd.setAttribute('border','0');
		myTd.setAttribute('cellspacing','0');
		myTd.setAttribute('cellpadding','0');
		myTd.setAttribute('height','10');
		myTd.setAttribute('width',size);
		myTr.appendChild(myTd);
		if (size<50) {
			var myTd2=document.createElement('td');
			myTd2.setAttribute('border','0');
			myTd2.setAttribute('cellspacing','0');
			myTd2.setAttribute('cellpadding','0');
			if (color==-3) myTd2.setAttribute('bgcolor','#00FF00'); else myTd2.setAttribute('bgcolor','#FFFFFF');
			myTd2.setAttribute('height','10');
			myTd2.setAttribute('width',50-size);
			myTr.appendChild(myTd2);
		}
		if (comment=='') 
			myTable.setAttribute('title',pvr+'/'+pv+'PV ');
		else 
			myTable.setAttribute('title',comment);
		return myTable;
}

function createTableI(myImg, myTable) {		
		var myTableI=document.createElement('span');
		if (myTable) myTableI.appendChild(myTable);
		myTableI.appendChild(document.createTextNode(" "));
		if (myImg) myTableI.appendChild(myImg);
		return(myTableI);		
}

function createTableT(myText, myTable) {			
		var myTableT=document.createElement('table');
		myTableT.setAttribute('border','0');
		myTableT.setAttribute('cellspacing','1');
		myTableT.setAttribute('cellpadding','0');
		var myTr=document.createElement('tr');
		myTableT.appendChild(myTr);
		var myTd=document.createElement('td');
		myTd.appendChild(myTable);
		myTr.appendChild(myTd);
		var myTd=document.createElement('td');
		var iTexte=document.createElement('div')
		iTexte.innerHTML = myText
		myTd.appendChild(iTexte);
		myTr.appendChild(myTd);	
		return(myTableT)
}


function createNewTroll(key, dist, infosTroll) {
		var trvITM = document.createElement('TR');
		if (document.getElementsByName('deldiplo')[0].checked == false) {
			if (isStyleClass)
				trvITM.setAttribute('class','mh_trolls_invisibles');   //Color des invisibles
			else
				trvITM.setAttribute('bgcolor','#CCC102');   //Color des invisibles
		} else {
	      	trvITM.style.backgroundColor="";			// pas de diplo couleur standard
      		trvITM.setAttribute('class','mh_tdpage');
      	}
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[0].appendChild(document.createTextNode(dist));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[1].appendChild(document.createTextNode(key));
		trvITM.appendChild(document.createElement('TD')); //boite pour Message Privé
   	 	trvITM.childNodes[2].setAttribute( 'align', 'center' );
	    var cb=document.createElement('INPUT');
		cb.setAttribute('type','checkbox');
		cb.setAttribute('name','mp_'+key);
		trvITM.childNodes[2].appendChild(cb);
		trvITM.appendChild(document.createElement('TD'));
	    trvITM.childNodes[3].appendChild(document.createElement('A'));
	    trvITM.childNodes[3].childNodes[0].setAttribute('CLASS','AllLinks');
	    trvITM.childNodes[3].childNodes[0].setAttribute('href','javascript:EPV('+key+')');
	   	trvITM.childNodes[3].childNodes[0].appendChild(document.createTextNode(infosTroll[5]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[4].appendChild(document.createTextNode(infosTroll[11]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[5].appendChild(document.createTextNode(infosTroll[10]));
		trvITM.appendChild(document.createElement('TD'));
		if (infosTroll[9]==0) {
		 		trvITM.childNodes[6].innerHTML ='<I>'+infosTroll[2]+'</I>:<B><FONT COLOR=#990000> '+infosTroll[4]+'</B></FONT> PA=> <FONT COLOR=#990000><B>'+infosTroll[3]+'</B></FONT> [hors vue]';
		} else {
		 		trvITM.childNodes[6].innerHTML ='<I>'+infosTroll[2]+'</I>:<B><FONT COLOR=#990000> '+infosTroll[4]+'</B></FONT> PA=> <FONT COLOR=#990000><B>'+infosTroll[3]+'</B></FONT> [camouflé]';
		}
		var myTable=createBarrePV(0, infosTroll[0], infosTroll[1], '');
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[7].appendChild(myTable);
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[8].setAttribute('align','center');
		trvITM.childNodes[8].appendChild(document.createTextNode(infosTroll[6]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[9].setAttribute('align','center');
		trvITM.childNodes[9].appendChild(document.createTextNode(infosTroll[7]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[10].setAttribute('align','center');
		trvITM.childNodes[10].appendChild(document.createTextNode(infosTroll[8]));
        return trvITM;
}

//----------------------------------------------------------------------------------------------------
function createForm(url,nom) {
  var myForm=document.createElement('form');
  myForm.setAttribute('method','post');
  myForm.setAttribute('align','right');
  myForm.setAttribute('action',url);
  myForm.setAttribute('name',nom);
  return myForm;
}  

function createMsgPXBouton() {
  var myForm=createForm('../Messagerie/MH_Messagerie.php?&dest=', 'sendMP');
  appendSubmit(myForm, 'Envoyer un MP', function() {document.getElementsByName('sendMP')[0].action=sendMessagePrive(3);});
  myForm.appendChild(document.createTextNode(" "));
  appendSubmit(myForm, 'Partage PX', function() {document.getElementsByName('sendMP')[0].action=sendMessagePrive(8);});
  myForm.appendChild(document.createTextNode(" "));
  appendSubmit(myForm, 'Partage ZZ', function() {document.getElementsByName('sendMP')[0].action=grantPartageZZ();});
  return myForm;
}  


function grantPartageZZ() {
  var MP=ZZDB+"/zoryazilla.php?&Source=MH&action=MyShare&TypeShr=NewShr&User=";
  for ( var i = 1; i < x_trolls.length-2;i++)
  {		
		if ( x_trolls[2+i].childNodes[2].firstChild.checked ) {
			MP += x_trolls[2+i].childNodes[1].childNodes[0].nodeValue+','; 
		}
  }  
//  document.sendMP.action=MP;
  return MP;	
} 

function sendMessagePrive(cat) {
  var MP="../Messagerie/MH_Messagerie.php?cat="+cat+"&dest=";
  for ( var i = 1; i < x_trolls.length-2;i++)
  {
		if ( x_trolls[2+i].childNodes[2].firstChild.checked ) {
			if (cat==8) MP += '%2C'+x_trolls[2+i].childNodes[1].childNodes[0].nodeValue; 
			else MP += '+'+x_trolls[2+i].childNodes[1].childNodes[0].nodeValue+'%2C'; 
		}
  }  
  if (cat==8) MP=MP.replace("=%2C", "=");
//  document.sendMP.action=MP;
  return MP;	
} 


//Le bouton pour Message/Distrib PX
function putMsgPXBouton(arrtable) {
  arrtable.parentNode.insertBefore(createMsgPXBouton(),arrtable);     

}


//----------------------------------------------------------------------------------------------------
function setInfosTrolls() {
 if (x_trolls.length<3) return;		// cas du fumeux qui rend aveugle !!!
  var used=false;
  incT=2;		//ITM: decalage des X,Y,N (des trolls à cause de la barre de PV)  + MP
  var PosX, PosY, PosN;
 
  var newB = document.createElement( 'b' );
  newB.appendChild( document.createTextNode( 'PV' ) );
  var newTd = document.createElement( 'td' );
  newTd.setAttribute( 'width', '55' );
  newTd.appendChild( newB );
  x_trolls[2].insertBefore( newTd, x_trolls[2].childNodes[6] );

  var newB = document.createElement( 'b' );
  newB.appendChild( document.createTextNode( 'MP' ) );
  var newTd = document.createElement( 'td' );
  newTd.setAttribute( 'width', '5' );
  newTd.setAttribute( 'align', 'center' );
  newTd.appendChild( newB );
  x_trolls[2].insertBefore( newTd, x_trolls[2].childNodes[2] );
  x_trolls[2].parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].setAttribute('colspan','11');
  //setAllTags=ZZsetAllTags;    //on veride a cause de la collone supplémentaire 


  // inserer le troll dans la vue (le tableau d'entré est trié par distance croissante
  var infosTrollID=new Array(); var nbIT=0;  for (var key in infosTrolls) {infosTrollID[nbIT]=key; nbIT++;}
  var zzTroll=0;

  for ( var i = 1; i < x_trolls.length-2;i++) {
     var num = x_trolls[2+i].childNodes[1].childNodes[0].nodeValue;
     var newTd = document.createElement( 'td' );		// Pour la box MP
     newTd.setAttribute( 'width', '5' );
	 newTd.setAttribute( 'align', 'center' );

     // Marquer la case occupé!
    var PosX=x_trolls[2+i].childNodes[4+incT].childNodes[0].nodeValue;
    var PosY=x_trolls[2+i].childNodes[5+incT].childNodes[0].nodeValue;
    var PosN=x_trolls[2+i].childNodes[6+incT].childNodes[0].nodeValue;
    bookedCase[PosX+','+PosY+','+PosN]=true;

	if (!setCheckBoxCookie(checkBoxDiplo, "NODIPLO")) {		// affichage de la diplo si demandé
    	if(ct[num]) { //Diplo des trolls
      		if(isStyleClass && ct[num]=='#AAFFAA') x_trolls[2+i].setAttribute('class','mh_trolls_amis'); 
			else if(isStyleClass && ct[num]=='#FFAAAA') x_trolls[2+i].setAttribute('class','mh_trolls_ennemis');
			else if(isStyleClass && ct[num]=='#FFD3D3') x_trolls[2+i].setAttribute('class','mh_trolls_conflit');
      		else { x_trolls[2+i].setAttribute('class',''); x_trolls[2+i].style.backgroundColor=ct[num]; }
	    }     
    	else if(x_trolls[2+i].childNodes[5].childNodes[0].nodeName=="A") {
      		var lien = x_trolls[2+i].childNodes[5].childNodes[0].getAttribute('href');
      		lien=lien.substring(lien.indexOf('(')+1,lien.indexOf(','));
      		if(cg[lien]) {
         		if(isStyleClass && cg[lien]=='#AAFFAA')  x_trolls[2+i].setAttribute('class','mh_guildes_amis');
         		else if(isStyleClass && cg[lien]=='#FFAAAA') x_trolls[2+i].setAttribute('class','mh_guildes_ennemis');
         		else if(isStyleClass && cg[lien]=='#BBBBFF') x_trolls[2+i].setAttribute('class','mh_guildes_perso');
         		else if(isStyleClass && cg[lien]=='#FFD3D3') x_trolls[2+i].setAttribute('class','mh_guildes_conflit');
         		else { x_trolls[2+i].setAttribute('class',''); x_trolls[2+i].style.backgroundColor=cg[lien]; }
      		}     
    	}
	}
	 
     if(infosTrolls[num])
     {
        used=true;
        var infosTroll=infosTrolls[num];
		infosTroll[9]=-1;  // si on le voit, le troll n'est pas camouflé ou est sur notre case

		var guilde=""; try {guilde=x_trolls[2+i].childNodes[5].childNodes[0].childNodes[0].nodeValue;} catch (e) {}
		var lien=x_trolls[2+i].childNodes[5].innerHTML;
        lien=lien.substring(lien.indexOf('(')+1,lien.indexOf(')'));
		var eITM=document.createElement('A');
		eITM.innerHTML ='<SPAN TITLE="'+guilde+'"><FONT COLOR=#000000><I>'+infosTroll[2]+'</I>:<B></FONT><FONT COLOR=#990000> '+infosTroll[4]+'</B></FONT><FONT COLOR=#000000> PA=> </FONT><FONT COLOR=#990000><B>'+infosTroll[3]+'</B></FONT></SPAN>';
		eITM.setAttribute('href','javascript:EAV('+lien+')');
 	 	x_trolls[2+i].childNodes[5].replaceChild(eITM,x_trolls[2+i].childNodes[5].firstChild);
 
		var myTable=createBarrePV(0, infosTroll[0], infosTroll[1], '');
		x_trolls[2+i].insertBefore(document.createElement('td'),x_trolls[2+i].childNodes[6]);
		x_trolls[2+i].childNodes[6].appendChild(myTable);
     }
     else
     {
        x_trolls[2+i].insertBefore(document.createElement('td'),x_trolls[2+i].childNodes[6]);
     }

     x_trolls[2+i].insertBefore(newTd,x_trolls[2+i].childNodes[2]);
	 var cb=document.createElement('INPUT');
	 cb.setAttribute('type','checkbox');
	 cb.setAttribute('name','mp_'+num);
  	 x_trolls[2+i].childNodes[2].appendChild(cb);
  	 
  } 
  for ( var i = 1; i < x_trolls.length-2;i++) {
  	 // on ajoute les copain si pas en vue
  	 while (zzTroll<nbIT) 
  	 { 
  		var flagNewTroll=false;
	  	var key=infosTrollID[zzTroll];
//  		if (key==num) { zzTroll++;  if (zzTroll>=nbIT) break; key=infosTrollID[zzTroll]; }
    	var infosTroll=infosTrolls[key];
  		while ((key==num)||(infosTroll[9]<0)) { zzTroll++;  if (zzTroll>=nbIT) break; key=infosTrollID[zzTroll]; infosTroll=infosTrolls[key]; }
		if (zzTroll>=nbIT) break;
        var dist=Math.max(Math.abs(ZPOSX-infosTroll[6]), Math.abs(ZPOSY-infosTroll[7]),Math.abs(ZPOSN-infosTroll[8]));
        var xdist = x_trolls[2+i].childNodes[0].childNodes[0].nodeValue;
        if (dist<xdist) flagNewTroll=true;
        else if (dist==xdist){
           	if (x_trolls[2+i].childNodes[10].childNodes[0].nodeValue>=infosTroll[8]) flagNewTroll=true;
	        else if (x_trolls[2+i].childNodes[10].childNodes[0].nodeValue==infosTroll[8]){
	           	if (x_trolls[2+i].childNodes[8].childNodes[0].nodeValue<=infosTroll[6]) flagNewTroll=true; 
		        else if (x_trolls[2+i].childNodes[8].childNodes[0].nodeValue==infosTroll[6]){
		           	if (x_trolls[2+i].childNodes[9].childNodes[0].nodeValue<infosTroll[7]) flagNewTroll=true; 
		        }
	         }
         }
         
         if (flagNewTroll==false) {
		 	break;
		 } else {	       
			used=true;
            var trvITM = createNewTroll(key, dist, infosTroll);
			x_trolls[2+i].parentNode.insertBefore(trvITM, x_trolls[2+i]) ;		 		// insertion dans la liste
			nbTrolls++; 	// Un troll de plus pour MZ 
			zzTroll++;		// voir pour positionner le troll suivant
			i++;			// on bypass le troll que l'on vient d'affciher
	  	}
     }
  } // fin de boucle sur la liste des trolls
  
  // afficher tous ceux qui sont trop loin donc hors vue!
  while (zzTroll<nbIT) 
  { 
			used=true;
  			var key=infosTrollID[zzTroll];  
	    	var infosTroll=infosTrolls[key];
	        var dist=Math.max(Math.abs(ZPOSX-infosTroll[6]), Math.abs(ZPOSY-infosTroll[7]),Math.abs(ZPOSN-infosTroll[8]));
            var trvITM = createNewTroll(key, dist, infosTroll);
			x_trolls[x_trolls.length-1].parentNode.appendChild(trvITM)
			nbTrolls++; 	// Un troll de plus pour MZ 
			zzTroll++;		// voir pour positionner le troll suivant
			i++;			// on bypass le troll que l'on vient d'affciher
  }
  if(!used) removeInfosTrolls();
}

function removeInfosTrolls() {
  x_trolls[2+0].parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].setAttribute('colspan','10');
  for ( var i = 0; i < x_trolls.length-2;i++) x_trolls[2+i].removeChild(x_trolls[2+i].childNodes[7] );
  incT=1;
}


//----------------------------------------------------------------------------------------------------
function analyseIG(idx) {
   idx=1*idx;		// conversion en int
   var Id=x_monstres[2+idx].childNodes[1].childNodes[0].nodeValue;
   var analyse="<b>Gowap de:</b> "+gogo[Id][1]+"<BR>";
   if (gogo[Id][8]!=0) {
       var charge=parseInt(((gogo[Id][9]*2)/gogo[Id][8])*100);	
       var dispo=parseInt((gogo[Id][8]-2*gogo[Id][9])/2);	
   	   analyse+="<font size=-2>"+ gogo[Id][2]+":</FONT> Chargé à <B>"+charge+"%</B><font size=-2><I> (reste "+dispo+" min dispo)</I></FONT><BR>";
   }

   if ((gogo[Id][4]!=0)||(gogo[Id][5]!=0)||(gogo[Id][6]!=0)||(gogo[Id][7]!=0)) {
   	   analyse+="<BR><b><i><u>les ordres:</i></b></u><BR>";
	   if ((gogo[Id][4]!=0)||(gogo[Id][5]!=0)||(gogo[Id][6]!=0)) {
	   	   analyse+="Va en direction de X=<B>"+gogo[Id][4]+"</B> Y=<B>"+gogo[Id][5]+"</B> N=<B>"+gogo[Id][6]+"</B><BR>";
   	   }
	   if (gogo[Id][7]!=0) {
	   	   analyse+="Va ramasser le trésor #"+gogo[Id][7]+"<BR>";
   	   }
   } 
   return analyse;
}

function showPopup4(evt) {
	var id = this.getAttribute("id");

	var texte = analyseIG(id);
	if(texte=="") return;
	popup.innerHTML = texte;
	popup.style.left = Math.min(evt.pageX + 15,window.innerWidth-400) + 'px';
	popup.style.top = evt.pageY-30 + 'px';
	popup.style.visibility = "visible";
}

function analyseIT(idx) {
   idx=1*idx;		// conversion en int
   var analyse="";
   var Id=x_tresors[2+idx].childNodes[1].childNodes[0].nodeValue;
   var tx=x_tresors[2+idx].childNodes[3].childNodes[0].nodeValue;
   var ty=x_tresors[2+idx].childNodes[4].childNodes[0].nodeValue;
   var tn=x_tresors[2+idx].childNodes[5].childNodes[0].nodeValue;
   for (var key in gogo) {
	  g=gogo[key];
      if (Id==g[7])  {
		   analyse+="Le gowap (<font size=-2>de <B>"+g[1]+"</B></font>) <B>#"+key+"</B> va ramasser ce trésor<br>";
      } else if ((tx==g[4])&&(ty==g[5])&&(tn==g[6]))  {
		   analyse+="Le gowap (<font size=-2>de <B>"+g[1]+"</B></font>) <B>#"+key+"</B> va dans cette caverne<br>";
      }
   }
   return analyse;
}

function showPopup3(evt) {
	var id = this.getAttribute("id");

	var texte = analyseIT(id);
	if(texte=="") return;
	popup.innerHTML = texte;
	popup.style.left = Math.min(evt.pageX + 15,window.innerWidth-400) + 'px';
	popup.style.top = evt.pageY-30 + 'px';
	popup.style.visibility = "visible";
}

function showPopup6(evt) {
	//var tresorInfo=new Array();		// Carac des Trésros de la coterie  => Global
 
 	var MatosId = this.getAttribute("MatosId");
	popup.innerHTML = "<IMG SRC='"+SkinZZ+"loading.png'>";
	popup.style.left = Math.min(evt.pageX + 15,window.innerWidth-400) + 'px';
	popup.style.top = evt.pageY-30 + 'px';
	popup.style.visibility = "visible";

	MZ_xmlhttpRequest({
				method: 'GET',
				url: ZZDB+"/mzTresor.php?&num="+numTroll+"&MatosId="+MatosId,	
				headers : {
					'User-agent': 'Mozilla/4.0 [FusionZoryaZilla] (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml'
				},
				onload: function(responseDetails) {
					try
					{
						var texte = responseDetails.responseText;

						var lines = texte.split(";");
						if(lines.length==0)
							return;
						for(var j=0;j<lines.length;j++)
						{
								var  xl = lines[j].split("]=");
								if (xl.length==2) 
								{
									var varname=xl[0].substr(0,xl[0].indexOf("["));
								    var idx=xl[0].substr(xl[0].indexOf("[")+1);
									var xv=xl[1].slice(xl[1].indexOf('("')+2, xl[1].length-1);
									var values=xv.split('","');
									if (varname=="tresorInfo") {
	 									tresorInfo[idx]=values;
	 								} 
								} 
						}

						if (tresorInfo[MatosId]) {
								var tresor=tresorInfo[MatosId];
								if (tresor[5]!="0") tresor[5]="Gowap #"+tresor[5]+" de "; else tresor[5]="";
								if (tresor[2].indexOf(':')>0) var type=tresor[2].substr(0, tresor[2].indexOf(':')-1); else var type='';
								var span="<B>"+tresor[2]+"<BR>Caractéristiques : "+tresor[3]+"<BR>"+tresor[4]+"<BR>Vu par : "+tresor[5]+tresor[6]+" le "+tresor[0]+"</B>";
								if (skinTresor[type]) 
									popup.innerHTML = '<table><tr><td><img src="'+SkinZZ+skinTresor[type]+'"</td><td>'+span+'</td></tr></table>';
								else
									popup.innerHTML = span;
							} else {
								popup.innerHTML = "<B>Ce trésor n'a pas été vu auparavant</B>";
						 	}
					}
					catch(e) {} 
				}
				});

}

function setInfosTresorsIdent() {
    for (var i=1;i<x_tresors.length-2;i++) {
        var dist=x_tresors[2+i].childNodes[0].childNodes[0].nodeValue;
        var idt=x_tresors[2+i].childNodes[1].childNodes[0].nodeValue;

	    //if (ZTRE>0) if (dist>ZTRE) return;
	    if ((ZTRE>0) && (dist>ZTRE)) return;
	  
	    if (tresorInfo[idt]) {
			var tresor=tresorInfo[idt];
	  		var tr = x_tresors[i+2].childNodes[2];
	  		if (tresor[2].indexOf(":")>0) tresor[2]=tresor[2].substring(tresor[2].indexOf(":"));
			tr.appendChild(document.createTextNode(" "+tresor[2]));
	    }
	}	
}

function setInfosTresors() {

    for (var i=1;i<x_tresors.length-2;i++) {
      var dist=x_tresors[2+i].childNodes[0].childNodes[0].nodeValue;
      var idt=x_tresors[2+i].childNodes[1].childNodes[0].nodeValue;
      var tx=x_tresors[2+i].childNodes[3].childNodes[0].nodeValue;
      var ty=x_tresors[2+i].childNodes[4].childNodes[0].nodeValue;
      var tn=x_tresors[2+i].childNodes[5].childNodes[0].nodeValue;

	//if (ZTRE>0) if (dist<=ZTRE) idMatos+=idt+',';		// si ZTRE=0, il n'y avait rien!!!
	if ((ZTRE==0) || (dist<=ZTRE)) idMatos+=idt+',';		
	
      if (!bookedCase[tx+','+ty+','+tn]) {
         x_tresors[2+i].setAttribute('class',''); 
         if (ZPOSN==tn) {
			if (isStyleClass) x_tresors[2+i].setAttribute('class','mh_tresors_teleks'); else x_tresors[2+i].style.backgroundColor='#EDE080';  //'#D1CE8C';
		 } else {
			if (isStyleClass) x_tresors[2+i].setAttribute('class','mh_tresors_gogos'); else x_tresors[2+i].style.backgroundColor='#EFE7A7';  //'#FFFDAA';
		 }
      }

	  for (var key in gogo) {
		  g=gogo[key];
	      if ((idt==g[7])||((tx==g[4])&&(ty==g[5])&&(tn==g[6])))  {
	          	x_tresors[2+i].childNodes[1].setAttribute('style','color:red');
	          	//x_tresors[2+i].childNodes[1].setAttribute('onmouseover','afficheIG('+i+',analyseIT, event)');
	          	//x_tresors[2+i].childNodes[1].setAttribute('onmouseout','cacherIG()');
				x_tresors[2+i].childNodes[1].setAttribute("id",i);
				x_tresors[2+i].childNodes[1].addEventListener("mouseover", showPopup3, true);
				x_tresors[2+i].childNodes[1].addEventListener("mouseout", hidePopup, true);
	          	break;  // sortie des gogos voir trésor suivants 
	      }
      }

	  var tresor=x_tresors[2+i].childNodes[2].childNodes[0].childNodes[0].nodeValue;
	  if ((tresor.length>1) && (tresor.indexOf("Gigot")<0)) {
			var myImg=document.createElement('img');
  			myImg.setAttribute('src',SkinZZ+'question.png');
			myImg.setAttribute("MatosId",idt);
			//myImg.setAttribute("onclick","javascript:Enter('/mountyhall/View/TresorHistory2.php?ai_IDTresor="+idt+"',750,500)");
			myImg.addEventListener("mouseover", showPopup6, true);
			myImg.addEventListener("mouseout", hidePopup, true);
			x_tresors[2+i].childNodes[2].appendChild(myImg);
	  }
   }
}

//----------------------------------------------------------------------------------------------------
function getAllText(Element) {
   if(Element.nodeName == "#text") {
      var thisText=Element.nodeValue.replace(/[\t\n\r]/gi,' ');
      thisText=thisText.replace(/[ ]+/gi,' ');
      if(thisText==" ") return '';
      return thisText;
   }
   if(Element.nodeName.toLowerCase() == "script" || Element.nodeName.toLowerCase() == "noframes") return "";
   var string=''
   if(Element.nodeName.toLowerCase() == "tbody" || Element.nodeName.toLowerCase() == "center" || Element.nodeName.toLowerCase() == "br") string='\n';
   if(Element.nodeName.toLowerCase() == "li") string='';
   for(var i=0;i<Element.childNodes.length;i++) {
     //string+=' '+Element.nodeName+' : ';
     string+=getAllText(Element.childNodes[i]);
     if(Element.nodeName.toLowerCase() == "tbody" && i<Element.childNodes.length-1) string+='\n';
     else if(Element.nodeName.toLowerCase() =='tr' && i<Element.childNodes.length-1) string+=' ';
   }
   if(Element.nodeName.toLowerCase() == "center" || Element.nodeName.toLowerCase() == "li") string+='\n';
   return string;
}

function createNewLieu(dist, infosLieu) {
		var cDate = new Date();
		var pDate = new Date(infosLieu[0].substring(5,7)+" "+infosLieu[0].substring(8,10)+", "+infosLieu[0].substring(0,4)+" "+infosLieu[0].substring(11,16)+":00");
		var trvITM = document.createElement('TR');
		if (((cDate-pDate)/1000/60/60/24)<30) {	// Un mois dangeureux!
			if (isStyleClass) trvITM.setAttribute('class','mh_pieges_actifs');   //Color des pieges CSS
			else trvITM.setAttribute('bgcolor','#FF5E28');   //Color des pieges ROUGE Explosif
		} else {
			if (isStyleClass) trvITM.setAttribute('class','mh_pieges_vieux');   //Color des pieges CSS
			else trvITM.setAttribute('bgcolor','#9DA8C6');   //Color des pieges Gris (plus de 30 jours)
		}
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[0].appendChild(document.createTextNode(dist));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[1].setAttribute('align','center');
		trvITM.childNodes[1].appendChild(document.createTextNode('0'));
		trvITM.appendChild(document.createElement('TD'));

		var chance="";
	    var _mm=infosLieu[5]*1;
		if ((MZ_getValue("RM_TROLL")!="") && (_mm>0)) {
			var _rm=MZ_getValue("RM_TROLL")*1;
			if(_mm<0) _sr="10"; else if(_rm<_mm) _sr=Math.max(10,Math.floor((_rm/_mm)*50)); else _sr=Math.min(90,Math.floor(100-(_mm/_rm)*50));
			chance=" (chance de résister: "+_sr+"%)";
		}
 		trvITM.childNodes[2].innerHTML ='<I>'+infosLieu[0]+'</I><span> Piège à '+infosLieu[6]+'</span>: <B><FONT COLOR=#2850FF> '+infosLieu[4]+'</B></FONT> a posé ce piège ';
 		if (_mm>0) trvITM.childNodes[2].innerHTML +='<FONT COLOR=#2850FF><B> MM='+infosLieu[5]+'</B></FONT>'+chance;
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[3].setAttribute('align','center');
		trvITM.childNodes[3].appendChild(document.createTextNode(infosLieu[1]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[4].setAttribute('align','center');
		trvITM.childNodes[4].appendChild(document.createTextNode(infosLieu[2]));
		trvITM.appendChild(document.createElement('TD'));
		trvITM.childNodes[5].setAttribute('align','center');
		trvITM.childNodes[5].appendChild(document.createTextNode(infosLieu[3]));
        return trvITM;
}


function setInfosLieux() {

  for (var i=1; i<x_lieux.length-2; i++) {	//vérif des trous de météorites
		if (x_lieux[2+i].childNodes[0].childNodes[0].nodeValue>1) break;
		var nom = getAllText(x_lieux[2+i].childNodes[2]);
		if (nom=="Trou de Météorite") infosAlerteTrou=true;
  }


  if (infosPieges.length<=0) return;
  var used=false;				  
  // affichage des Pieges
  for (var key in infosPieges) {
     var infosPiege=infosPieges[key];
     var dist=Math.max(Math.abs(ZPOSX-infosPiege[1]), Math.abs(ZPOSY-infosPiege[2]),Math.abs(ZPOSN-infosPiege[3]));
     if (dist>0) {
      	 if (dist==1) infosAlertePiege=true; //attention au piege
         var ilig=x_lieux.length-2;
         for ( var i = 1; i < x_lieux.length-2;i++)  {
             var xdist = x_lieux[2+i].childNodes[0].childNodes[0].nodeValue;
             if (dist<xdist) {
                 ilig=i;
                 break;
             }
         }
         // Préparer une nouvelle entrée tableau pour le piege
		var trvITM = createNewLieu(dist, infosPiege) ;
        //tlie.childNodes[1].insertBefore(trvITM, tlie.childNodes[1].childNodes[ilig]);

		if (ilig==x_lieux.length-2) x_lieux[1+ilig].parentNode.appendChild(trvITM) ;		// ajout en fin de liste
		else x_lieux[2+ilig].parentNode.insertBefore(trvITM, x_lieux[2+ilig]) ;		 		// insertion dans la liste
		nbLieux++; 	// Un lieu de plus pour MZ 
        used=true;			        
     }
  }
}

//----------------------------------------------------------------------------------------------------
function showPopup5(evt) {
   var id = this.getAttribute("id");
	var texte = analyseCDM(id);
	if(texte=="") return;
	popup.innerHTML = texte;
	popup.style.left = Math.min(evt.pageX + 15,window.innerWidth-400) + 'px';
	popup.style.top = evt.pageY-30 + 'px';
	popup.style.visibility = "visible";
}

function analyseCDM (idx) {
   idx=1*idx;		// conversion en int
   var id=x_monstres[2+idx].childNodes[1].childNodes[0].nodeValue;
   var fullname=x_monstres[2+idx].childNodes[3].childNodes[0].childNodes[0].nodeValue;

   if (x_monstres[2+idx].childNodes[2].childNodes[0].nodeValue=="-") return;		// pas de CdM possible
   if ((fullname.indexOf("Gowap")>=0) &&(cmdMonstre[11]!='???')) return;		// Gowap sans CdM


   //les infos de la bulle:
   var cmdMonstre = listeCDM[id];  

   var Bestiaire="BESTIAIRE"; 
   var barrePV;
   var Blessure;
   if (cmdMonstre[11].indexOf("%")>0) {

    	Bestiaire="CDM du <br><b>"+cmdMonstre[11].slice(cmdMonstre[11].indexOf('le')+2)+"</b>";
		Blessure="&nbsp&nbsp&nbsp"+bbcode(cmdMonstre[11]); 
		if (cmdMonstre[11].indexOf("%")!=-1) {
			var b=1*cmdMonstre[11].slice(cmdMonstre[11].indexOf("[b]")+3,  cmdMonstre[11].indexOf(" %"));
			if ((b!=0) && (cmdMonstre[2].indexOf("-")!=-1)) {
		        var pv2 = cmdMonstre[2].substring(0,cmdMonstre[2].indexOf("-"))*1;
		        var pv1 = cmdMonstre[2].substring(cmdMonstre[2].indexOf("-")+1,cmdMonstre[2].indexOf(" -->"))*1;
		        var p1=92.5;  if (b!=95) p1=b-5; if (p1<0) p1=0;
		        var pva1 = Math.floor(pv1 * (100 - p1) / 100);
		        var p2=92.5;  if (b!=90) p2=b+5; if (p2>100) p2=100;
		     	var pva2 = Math.floor(pv2 * (100 - p2) / 100)+1;
		     	var pvm = Math.floor((pva1+pva2)/2);
		        Blessure="&nbsp&nbsp&nbsp<b>"+b+"%</b> =><b>"+pvm+"</b> PV (entre <b>"+pva2+"</b> et <b>"+pva1+"</b>)"; 
		    } else if ((b!=0) && (cmdMonstre[2].indexOf("[b]")!=-1)) {
				var pv1=1*cmdMonstre[2].slice(cmdMonstre[2].indexOf("[b]")+3, cmdMonstre[2].indexOf("[/b]"));
		        var p1=92.5;  if (b!=95) p1=b-5; if (p1<0) p1=0;
		        var pva1 = Math.floor(pv1 * (100 - p1) / 100);
		        var p2=92.5;  if (b!=90) p2=b+5; if (p2>100) p2=100;
		     	var pva2 = Math.floor(pv1 * (100 - p2) / 100)+1;
		        Blessure="&nbsp&nbsp&nbsp<b>"+b+"%</b> reste entre <b>"+pva1+"</b> et <b>"+pva2+"</b> PV"; 
		    }
		}
		
    	var pv=100-cmdMonstre[11].substring(cmdMonstre[11].indexOf(']')+1,cmdMonstre[11].indexOf('%'));
    	var barrePV=createBarrePV(0, pv, 100, ''); 
   }
   
   // information de SR
   var cdmRM=bbcode(cmdMonstre[9]);
   if((cmdMonstre[9].indexOf("[b]")!=-1) && (MM_TROLL!="")) {
		var v=0;
		var mrm=1*cmdMonstre[9].slice(cmdMonstre[9].indexOf("[b]")+3,  cmdMonstre[9].indexOf("[/b]"));
		var tmm=MM_TROLL*1;
		if(tmm<0) v="10";
		else if(mrm<tmm) v=Math.max(10,Math.floor((mrm/tmm)*50));
		else v=Math.min(90,Math.floor(100-(tmm/mrm)*50));
	    cdmRM+=" <font size=-2>("+v+"%)</font>";
   }   

   var cdmMM="";
   // information de SR
   var cdmMM=cmdMonstre[18];
   if((cmdMonstre[18].indexOf("[b]")!=-1) && (RM_TROLL!="")) {
		var v=0;
		var mmm=1*cmdMonstre[12].slice(cmdMonstre[12].indexOf("[b]")+3,  cmdMonstre[12].indexOf("[/b]"));
		var trm=RM_TROLL*1;
		if(trm<0) v="90";
		else if(trm<mmm) v=Math.max(10,Math.floor((trm/mmm)*50));
		else v=Math.min(90,Math.floor(100-(mmm/trm)*50));
	    cdmMM=bbcode(cdmMM)+" <font size=-2>("+v+"%)</font>";
   }   

   var idMonstre = getMonstreDef(fullname);
   if (idMonstre>=0) var photo=SkinZZ+'/monstres/'+skinBEAST[tabMonstres[idMonstre][3]]; else photo=SkinZZ+'/monstres/'+skinBEAST[0];

	// recherche du template familliale cogneur, Spectrale et autre...
	var famille=cmdMonstre[1];
	var templateFamilly="";
	if (tmpltFamilly[famille] && caracFamilly[famille]) {
		var tmplt=tmpltFamilly[famille];
		var carac=caracFamilly[famille]; 
 		for (var k = 0; k < tmplt.length; k++) {
		if (fullname.indexOf(" "+tmplt[k]+" ") != -1) {	
				if (carac[k][1]!="") templateFamilly=tmplt[k]+': '+carac[k][1];
				break;
			}
		}
	}	

	var vlc="non"; var attdist=""; var att=""; var vit=""; var equip=""; var dla=""; var tour=""; var AM=""; var BM=""; var pouvoir=""; var range="";
	if (cmdMonstre[12]==1) vlc="oui";
	if(cmdMonstre[13]==1) attdist="oui"; else if(cmdMonstre[13]==0) attdist="non";
	//if(cmdMonstre[14]==1) att=1; else if(cmdMonstre[14]>1 && cmdMonstre[14]<=6) att=cmdMonstre[14]; else if(cmdMonstre[14]>6) attdist="Beaucoup";
	if(cmdMonstre[14]) att=cmdMonstre[14];
	if(cmdMonstre[15]!="") vit=bbcode(cmdMonstre[15]); 
	if(cmdMonstre[17] && cmdMonstre[17].length>0) equip=bbcode(cmdMonstre[17]);
	if(cmdMonstre[16]) range=bbcode(cmdMonstre[16]);
	if(cmdMonstre[10]) pouvoir=bbcode(cmdMonstre[10]);
	if(cmdMonstre[19]) dla=bbcode(cmdMonstre[19]);
	if(cmdMonstre[20]) BM=bbcode(cmdMonstre[20]);
	if(cmdMonstre[21]) tour=bbcode(cmdMonstre[21]);
	
   var strCDM ='<TABLE class="mh_tdborder" width="690" BORDER="0" CELLSPACING="1" CELLPADDING="2">';
   strCDM+='<TR class="mh_tdtitre"><TD>NIV: '+bbcode(cmdMonstre[0]) + analysePX(bbcode(cmdMonstre[0]))+'</td><TD colspan="4">'+id+' '+fullname+'</TD><TD colspan="2" align="center">'+bbcode(cmdMonstre[1])+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD rowspan="7" align="center" valign="center"><IMG SRC="'+photo+'"></td><TD class="mh_tdtitre">PdV:</TD><TD>'+bbcode(cmdMonstre[2])+'</TD><TD colspan="4">';
   if (cmdMonstre[11].indexOf("%")>0) strCDM+=barrePV.innerHTML+" "+Blessure; strCDM+='</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre">ATT:</TD><TD>'+bbcode(cmdMonstre[3])+'</TD><TD class="mh_tdtitre">VUE:</TD><TD>'+bbcode(cmdMonstre[8])+'</TD><TD colspan="2" rowspan="2" class="mh_tdtitre" align="center" valign="center">'+Bestiaire+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre">ESQ:</TD><TD>'+bbcode(cmdMonstre[4])+'</TD><TD class="mh_tdtitre">VLC:</TD><TD>'+vlc+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre">DEG:</TD><TD>'+bbcode(cmdMonstre[5])+'</TD><TD class="mh_tdtitre">M.M:</TD><TD>'+cdmMM+'</TD><TD class="mh_tdtitre">VIT:</TD><TD>'+vit+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre">REG:</TD><TD>'+bbcode(cmdMonstre[6])+'</TD><TD class="mh_tdtitre">R.M:</TD><TD>'+cdmRM+'</TD><TD class="mh_tdtitre">TR.:</TD><TD>'+tour+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre">ARM:</TD><TD>'+bbcode(cmdMonstre[7])+'</TD><TD class="mh_tdtitre">Att:</TD><TD>'+att+'</TD><TD class="mh_tdtitre">DLA:</TD><TD>'+dla+'</TD></TR>';
   strCDM+='<TR class="mh_tdpage"><TD class="mh_tdtitre" width=30>A.M:</TD><TD width="180">'+AM+'</TD><TD class="mh_tdtitre" width="30">Dist.:</TD><TD width="180">'+attdist+'</TD><TD class="mh_tdtitre" width="30">CHG:</TD><TD width="90">'+equip+'</TD></TR>';
   if (BM!="")  strCDM+='<TR class="mh_tdpage"><TD colspan="7">Bonus/Malus: '+BM+'</TD></TR>';
   strCDM+='<TR height=15 class="mh_tdtitre"><TD width="150">Pouvoir '+range+':</TD><TD width="540" colspan="6">'+pouvoir+'</td></TR>';
   if (templateFamilly!="")  strCDM+='<TR class="mh_tdpage"><TD colspan="7">'+templateFamilly+'</TD></TR>';


	var TypeMonstre=getEM(fullname);
	var infosCompo="";
	if (TypeMonstre!="") {
	   infosCompo=ZZcompoEM(TypeMonstre);
	   strCDM+='<TR class=mh_tdpage><TD colspan=7>Composant: '+infosCompo+'</TD></TR>';
	}
    strCDM+='</TABLE>';

	return strCDM;
}

function setInfosMonstres(step) {			// step=1 pour retrieveCDMs() et step=2 putInfoVUE()
  infoMonstreStep=infoMonstreStep+step;			
  if (infoMonstreStep<3) return;		

  var newB = document.createElement( 'b' );
  newB.appendChild( document.createTextNode( 'Ins. / PV' ) );
  var newTd = document.createElement( 'td' );
  newTd.setAttribute( 'width', '68' );
  newTd.appendChild( newB );
  var noeud=tmon.childNodes[2].childNodes[1];
  noeud.insertBefore( newTd, noeud.childNodes[4] );  
  //x_monstres[2+0].parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].setAttribute('colspan','8');
    
   
  incM=1;		//ITM: decalage des X,Y,N (des monstres à cause de la barre de PV) 
  var PosX, PosY, PosN;
  var used=false;
  var cDate = new Date();

  for ( var i = 1; i < x_monstres.length-2;i++) {
     var num = x_monstres[2+i].childNodes[1].childNodes[0].nodeValue;

 	 var myImg=''; 	    
     if (gogo[num]) { // Affichage des info de Gowap (les gowap ne sont pas insultés
    	  used=true;    // on garde la colone des PV qui sert au chargement gowap
          x_monstres[2+i].childNodes[1].setAttribute('style','color:red');
          x_monstres[2+i].childNodes[1].setAttribute("id",i);
          x_monstres[2+i].childNodes[1].addEventListener("mouseover", showPopup4, true);
          x_monstres[2+i].childNodes[1].addEventListener("mouseout", hidePopup, true);

		  // pour eviter le changement de couleur des cases sur lesquelles on passe la souris
		  if (MZ_getValue("NOLEVEL")) {
		      x_monstres[2+i].childNodes[2].setAttribute('onmouseover', "this.style.cursor = 'pointer';");
    		  x_monstres[2+i].childNodes[2].setAttribute('onmouseout', "");
		  }

	      if (gogo[num][0]==NUM_TROLL) { // Dilpo des Gogos
    	     x_monstres[2+i].setAttribute('class','');   
  			 if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_mes_gogos'); else x_monstres[2+i].style.backgroundColor='#AAFFAA';  
      	 } else {
         	x_monstres[2+i].setAttribute('class','');  
  			if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_gogos_coterie'); else x_monstres[2+i].style.backgroundColor='#BBBBFF';
         }
          
     } else { // popup CDM

          x_monstres[2+i].childNodes[1].setAttribute("id",i);
          x_monstres[2+i].childNodes[1].addEventListener("mouseover", showPopup5, true);
          x_monstres[2+i].childNodes[1].addEventListener("mouseout", hidePopup, true);

	    if  (MeInsulte[num]) { // spot insulte
	    	used=true;    
   	    	var myImg=createInsulteIMG(MeInsulte[num]);   	    
   	    }
     } 

     if (fam[num]) {
		  // pour eviter le changement de couleur des cases sur lesquelles on passe la souris
		  if (MZ_getValue("NOLEVEL")) {
		      x_monstres[2+i].childNodes[2].setAttribute('onmouseover', "this.style.cursor = 'pointer';");
    		  x_monstres[2+i].childNodes[2].setAttribute('onmouseout', "");
		  }
         if (fam[num][0]==NUM_TROLL) { 
         	x_monstres[2+i].setAttribute('class','');  
  		 	if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_mes_fams'); else x_monstres[2+i].style.backgroundColor='#99B599';
         } else {
         	x_monstres[2+i].setAttribute('class','');  
  		 	if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_fams_coterie'); else x_monstres[2+i].style.backgroundColor='#9C9CAF';
         }
	 }  

     if(listeCDM[num]) { // On a une les infos d'un bestiaire!

        var fullname=x_monstres[2+i].childNodes[3].childNodes[0].childNodes[0].nodeValue;
        if (fullname.indexOf("Gowap")<0) x_monstres[2+i].childNodes[1].setAttribute('style','color:blue');

        var infosMonstre=listeCDM[num];
		var blessure=infosMonstre[11];



		// Ajout Codage netWorms (affiché les monstres qui nous voient)
        if ((fullname.indexOf("Gowap")<0) && (fullname.indexOf("Familier")<0)) {
            var infosTroll=infosTrolls[NUM_TROLL];
            var vue = infosMonstre[8];
            var distance = eval(x_monstres[2+i].childNodes[0].childNodes[0].nodeValue);

            if((distance==0) || !infosTroll || ((!infosTroll[9]) || (infosMonstre[14]=='Oui'))) {
                var minmax = 1;
                if(vue.indexOf('-')<0) minmax = 0;

                var vueRe;
                if (minmax == 0) { vueRe = /(\d+)/; } else { vueRe = /(\d+)-(\d+)/; }

                var vueArr = vue.match(vueRe);
                if (vueArr) {
                    if (eval(vueArr[1]) >= distance) {
					  	// pour eviter le changement de couleur des cases sur lesquelles on passe la souris
					  	if (MZ_getValue("NOLEVEL")) {
		    				x_monstres[2+i].childNodes[2].setAttribute('onmouseover', "this.style.cursor = 'pointer';");
			    			x_monstres[2+i].childNodes[2].setAttribute('onmouseout', "");
					  	}
                      	x_monstres[2+i].setAttribute('class','');
                        if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_vue_monstre1'); else x_monstres[2+i].style.backgroundColor='#FFBBBB';		//#FF9999
                    }
                    if ((minmax == 1) && (eval(vueArr[1]) < distance && eval(vueArr[2]) >= distance)) {
					  	if (MZ_getValue("NOLEVEL")) {
		    				x_monstres[2+i].childNodes[2].setAttribute('onmouseover', "this.style.cursor = 'pointer';");
			    			x_monstres[2+i].childNodes[2].setAttribute('onmouseout', "");
					  	}
                        x_monstres[2+i].setAttribute('class','');
                        if (isStyleClass) x_monstres[2+i].setAttribute('class','mh_vue_monstre2'); else x_monstres[2+i].style.backgroundColor='#FFD3D3';		//#FFBBBB
                    }
                }
            }
        } // Fin codage netWorms


		var myTableCharge='';
	  	if (gogo[num]) {
 	    	 var g=gogo[num];
		     if(g[8]>0) {
		         var charge=parseInt(((g[9]*2)/g[8])*100);	
 		       	 var dispo=parseInt((g[8]-2*g[9])/2);	
                 myTableCharge=createBarrePV(-3, g[9]*2, g[8], 'Reste: '+dispo+' min dispo ('+g[2]+')');	     
             }
		}

		if (blessure.indexOf('%')<0) { 
	        x_monstres[2+i].insertBefore(document.createElement('td'),x_monstres[2+i].childNodes[4]);
			var myTableI=createTableI(myImg, myTableCharge);
			x_monstres[2+i].childNodes[4].appendChild(myTableI);				// barre de charge			
		} else {
	        var pv=100-blessure.substring(blessure.indexOf(']')+1,blessure.indexOf('%'));
	        var tpv=blessure.substring(blessure.indexOf('e')+1);
	        var oDate = new Date(tpv.substring(4,6)+" "+tpv.substring(1,3)+", 20"+tpv.substring(7,9)+" "+tpv.substring(12,17)+":00");

        	used=true;
	        var rpv=infosMonstre[2];
	        if ((rpv.indexOf('>')>0) && (rpv.indexOf('/')>0)) {
	        	rpv=Math.floor(rpv.substring(rpv.indexOf('>')+5,rpv.indexOf('/')-1));
	        	var rpvr=Math.floor(pv*rpv/100);
	        	tpv='~'+rpvr+'/'+rpv+' ('+tpv+')';
	        } else {
	          	tpv=100-pv+'% de '+rpv+' ('+tpv+')';
			}
			tpv=tpv.replace('[b]', '').replace('[/b]', '');		// pas de bbcode dans le span			
			x_monstres[2+i].insertBefore(document.createElement('td'),x_monstres[2+i].childNodes[4]);
			if (((((cDate-oDate)/1000/60/60/24)<5)||(pv==100))&&(myTableCharge!='')) var myTable=myTableCharge; // cas d'un gogo non blessé récement
			else if (((cDate-oDate)/1000/60/60/24)<5) var myTable=createBarrePV(0, pv, 100, tpv); else var myTable=createBarrePV(1, pv, 100, tpv);
			var myTableI=createTableI(myImg, myTable);			
			x_monstres[2+i].childNodes[4].appendChild(myTableI);					// barre de PV
	    }
     }
     else
     {
        x_monstres[2+i].insertBefore(document.createElement('td'),x_monstres[2+i].childNodes[4]);
		var myTableI=createTableI(myImg, '');
		x_monstres[2+i].childNodes[4].appendChild(myTableI);		// case vide (ni PV ni charge)
     }
  }
  
  if(!used) removeInfosMonstres();
}

function removeInfosMonstres() {
  x_monstres[2+0].parentNode.parentNode.childNodes[0].childNodes[0].childNodes[0].setAttribute('colspan','7');
  for ( var i = 0; i < x_monstres.length-2;i++) x_monstres[2+i].removeChild(x_monstres[2+i].childNodes[4] );
  incM=0;
}

/* ne sert plus en fusion
function delayInfosMonstres() { // déclanchement du script sur celui de 'compteMission' de MZ 
	__computeMission=computeMission;
	function ZZcomputeMission(begin, end) {setInfosMonstres(); __computeMission(begin, end); }
	computeMission=ZZcomputeMission;
}
*/

//----------------------------------------------------------------------------------------------------
// override de la focntion original de MZ à cause du décalage de la case MP
/* ne devrais plus servir, à vérifier et supprimer 
function ZZsetAllTags(infoTrolls,infoGuildes)
{
	for (var i = 1; i < nbTrolls; i++) 
	{
		var infos = infoGuildes[getTrollGuildeID(i)];
		if (infos) 
		{
			var tr = zz_trolls[i].childNodes[3];
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
		infos = infoTrolls[getTrollID(i)];
		if (infos) 
		{
			var tr = zz_trolls[i].childNodes[3];
			for(var j=0;j<infos.length;j++)
			{
				tr.appendChild(document.createTextNode(" "));
				tr.appendChild(createPopupImage(infos[j][0], infos[j][1]));
			}
		}
	}
}
*/

//----------------------------------------------------------------------------------------------------
function setInfosInfos() {
	//var ZPOS = getPosition();
	//var ZVUE = getPorteVue();

	if ((infosAlertePiege==true)||(infosAlerteTrou==true)) {
	    if (infosAlerteTrou==false) var MessageInf="INFORMATIONS => /!\\ ATTENTION :  Il y a un piège dans une caverne voisine !!";
	    else if (infosAlertePiege==false) var MessageInf="INFORMATIONS => /!\\ ATTENTION :  Il y a un trou dans une caverne voisine !!";
	    else var MessageInf="INFORMATIONS => /!\\ ATTENTION :  Il y a pièges et des trous autour de toi !!";
	 	tinf.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue = MessageInf ;
		if (isStyleClass) {
			tinf.childNodes[0].childNodes[0].childNodes[0].setAttribute('class','mh_pieges_actifs');   //Color des pieges CSS
			tinf.childNodes[0].childNodes[0].childNodes[0].setAttribute('onmouseout', "this.className='mh_pieges_actifs';");
		} else {
			tinf.childNodes[0].childNodes[0].childNodes[0].setAttribute('bgcolor','#FF5E28');
		}	
		tinf.childNodes[0].childNodes[0].childNodes[0].setAttribute('onmouseout', "");
		tinf.childNodes[0].childNodes[0].childNodes[0].setAttribute('onmouseover', "this.style.cursor='pointer';");
	} //else tinf.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue = "INFORMATIONS => Position : X = "+ZPOS[0]+", Y = "+ZPOS[1]+", N = "+ZPOS[2]+" --- Vue : "+ZVUE[0]+"/"+ZVUE[1]+" ("+ZVUE[2]+"/"+ZVUE[3]+")";
}


//----------------------------------------------------------------------------------------------------
function requestTresors() { 
		//alert(ZZDB+"/mzTresor.php?&num="+numTroll+"&MatosId="+idMatos);
		MZ_xmlhttpRequest({
		    method: 'GET',
		    url:  ZZDB+"/mzTresor.php?&num="+numTroll+"&MatosId="+idMatos,
		    headers: {
		        'User-agent': 'Mozilla/4.0 (compatible) Mountyzilla',
		        'Accept': 'application/xml,text/xml',
		    },
		    onload: function(responseDetails) {
				try
					{
						var texte = responseDetails.responseText;
						var lines = texte.split(";");
						if(lines.length==0)
							return;
						for(var j=0;j<lines.length;j++)
						{
								var  xl = lines[j].split("]=");
								if (xl.length==2) 
								{
									var varname=xl[0].substr(0,xl[0].indexOf("["));
								    var idx=xl[0].substr(xl[0].indexOf("[")+1);
									var xv=xl[1].slice(xl[1].indexOf('("')+2, xl[1].length-1);
									var values=xv.split('","');

									if (varname=="tresorInfo") {
	 									tresorInfo[idx]=values;
	 								} 
								} 
						}
						setInfosTresorsIdent();
					}
					catch(e) {alert(e);} 
			}
		});
}		

//----------------------------------------------------------------------------------------------------
function putSendVueBouton() {
 	if (externalVue) return;		// on envoi pas les vues etrangères.. elles y sont déjà!

	// créer le support
	var myForm = document.createElement('span');
	myForm.appendChild(document.createTextNode(" "));

	// créer le bouton (Attention: du type inpout et non submit!!!!)
	var button = document.createElement('input');
	button.setAttribute('type', 'button');
	button.setAttribute('name', 'sendZZVue');
	button.setAttribute('class', 'mh_form_submit');
	button.setAttribute('value', 'Envoyer la Vue à ZZ');
	button.addEventListener("click",function() {sendVue(0); return false}, true);
	myForm.appendChild(button);

	// l'inserer après le bouton de Vue2D
	document.getElementsByTagName('form')[0].appendChild(myForm);
}
 
function setInfosVue() {
	if (infosVue.length<=0) return true;		// si on a aucune info, il faut envoyer une vue!

	var vueselect = '&nbsp;&nbsp;&nbsp;&nbsp;<b><font size=-1>Gestionnaire de vue:&nbsp;&nbsp;</font></b>';
	var ZZVueId=0; 
	if (document.URL.indexOf("VueId=")>=0) {
 		ZZVueId=document.URL.substring(document.URL.indexOf("VueId=")+6);
 		ZZMaVue=document.URL.substring(document.URL.indexOf("MaVue=")+6, document.URL.indexOf("&VueId="))  
 		ZZVuePG=document.URL.substring(document.URL.indexOf("PG=")+3, document.URL.indexOf("&MaVue="))  
		vueselect += '<select onChange="if (this.selectedIndex==0) location.href=\''+ZZMaVue+'\'; else location.href=\''+ZZDB+'/Play_vue.php?&PG='+ZZVuePG+'&MaVue='+ZZMaVue+'&VueId=\'+this.options[this.selectedIndex].value+\'\';">';
		if (ZZMaVue!='zoryazilla.php') vueselect += '<option value=-1>MA VUE</option>';
	} else {
 		// détection du Pack graphique utilisé, pour rester dans les tons....
		var PG="";
		var nodesPG = document.evaluate("//img[contains(@src,'contenu/header.jpg')]", document, null,XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		if (nodesPG.snapshotLength==1) {
			PG=nodesPG.snapshotItem(0).src;
			PG=URLencode(PG.substring(0, PG.length-19));
		}
		vueselect += '<select onChange="location.href=\''+ZZDB+'/Play_vue.php?&PG='+PG+'&MaVue=\'+document.URL+\'&VueId=\'+this.options[this.selectedIndex].value+\'\';"><option value=-1>Sélectionner une vue</option>';
 	}

	var lastView="";
	for (i = 0; i < infosVue.length; i++) {
		var infos = infosVue[i];
		var selected='';
		if (infos[4]+'*'+infos[3]==ZZVueId) selected='selected';
		vueselect += '<option value="'+infos[4]+'*'+infos[3]+'" '+selected+'>'+infos[2]+' de '+infos[1]+' du '+infos[0]+'</option>';
		if ((infos[2]=='VUE') && (infos[4]==NUM_TROLL) && (lastView=="")) lastView=infos[0];
 	}
	vueselect += '</select>';

	var Now = new Date();
	var cDate = new Date(lastView.replace(/-/gi, "/"));

	var sselect = document.createElement('B');
	sselect.innerHTML = vueselect ;
	document.getElementsByTagName('B')[0].appendChild(sselect);  

	if ((!externalVue) && ((lastView=="") || ((Now.getTime()-cDate.getTime())>3600000)))
		return true;
	else 
		return false;
}

function sendVue(VueId) { 
	var flow="VUE";
	var maxRow=10;
	var nrow=0;
	var LF=String.fromCharCode(28);
	var TB=String.fromCharCode(29);

	if(VueId==0) { 		// supprimer le bouton s'il état là et afficher un petit message d'état.. 
		var arr = document.getElementsByName('sendZZVue');
		if (arr[0]) arr[0].parentNode.removeChild(arr[0]);
		var myForm = document.createElement('span');
		myForm.appendChild(document.createTextNode(" Vue en cours d'envoi à ZZ..."));
		myForm.setAttribute('name', 'sendZZVue');
		document.getElementsByTagName('form')[0].appendChild(myForm);
		flowVueCtrlMaxId=x_monstres.length;
	}

	var txtMon="";
	if (flowVueCtrl=="Mon") {
 		while ((flowVueCtrlId<x_monstres.length) && (nrow<maxRow)) {
			if (txtMon=="") txtMon="&Monstres=";
			txtMon += getMonstreID(flowVueCtrlId) + TB + getMonstreNom(flowVueCtrlId) + TB + getPositionStr(getMonstrePosition(flowVueCtrlId)).replace(/;/gi,TB) + LF;
			nrow++; 			
			flowVueCtrlId++;
 		}
  		if (flowVueCtrlId>=x_monstres.length) { flowVueCtrl="Tro";  flowVueCtrlId=3; flowVueCtrlMaxId=x_trolls.length;} 
	}

	var txtTro="";
	if (flowVueCtrl=="Tro") {
		var shift = (incT == 0 ? 0 : 1);
 		while ((flowVueCtrlId<x_trolls.length) && (nrow<maxRow)) {
			if (txtTro=="") txtTro="&Trolls=";			
			txtTro += x_trolls[flowVueCtrlId].childNodes[1].firstChild.nodeValue + TB +x_trolls[flowVueCtrlId].childNodes[2+shift].firstChild.firstChild.nodeValue + TB + x_trolls[flowVueCtrlId].childNodes[3+shift].firstChild.nodeValue + TB + x_trolls[flowVueCtrlId].childNodes[4+shift].firstChild.nodeValue + TB + x_trolls[flowVueCtrlId].childNodes[6+incT].firstChild.nodeValue + TB + x_trolls[flowVueCtrlId].childNodes[7+incT].firstChild.nodeValue +  TB + x_trolls[flowVueCtrlId].childNodes[8+incT].firstChild.nodeValue + LF ;
			nrow++; 			
			flowVueCtrlId++;
 		}
  		if (flowVueCtrlId>=x_trolls.length) { flowVueCtrl="Tre";  flowVueCtrlId=3; flowVueCtrlMaxId=x_tresors.length;} 
 	}

	var txtTre="";
	if (flowVueCtrl=="Tre") {
 		while ((flowVueCtrlId<x_tresors.length) && (nrow<maxRow)) {
			if (txtTre=="") txtTre="&Tresors=";
			txtTre += x_tresors[flowVueCtrlId].childNodes[1].firstChild.nodeValue + TB + getTresorNom(flowVueCtrlId) + TB + x_tresors[flowVueCtrlId].childNodes[3].firstChild.nodeValue + TB + x_tresors[flowVueCtrlId].childNodes[4].firstChild.nodeValue + TB + x_tresors[flowVueCtrlId].childNodes[5].firstChild.nodeValue + LF ;
			nrow++; 			
			flowVueCtrlId++;
 		}
  		if (flowVueCtrlId>=x_tresors.length) { flowVueCtrl="Cha";  flowVueCtrlId=3; flowVueCtrlMaxId=x_champis.length;} 
 	}

	var txtCha="";
	if (flowVueCtrl=="Cha") {
 		while ((flowVueCtrlId<x_champis.length) && (nrow<maxRow)) {
			if (txtCha=="") txtCha="&Champis=";
			txtCha += '0' + TB +x_champis[flowVueCtrlId].childNodes[1].firstChild.nodeValue + TB + x_champis[flowVueCtrlId].childNodes[2].firstChild.nodeValue + TB + x_champis[flowVueCtrlId].childNodes[3].firstChild.nodeValue + TB + x_champis[flowVueCtrlId].childNodes[4].firstChild.nodeValue + LF ;
			nrow++; 			
			flowVueCtrlId++;
 		}
  		if (flowVueCtrlId>=x_champis.length) { flowVueCtrl="Lie";  flowVueCtrlId=3; flowVueCtrlMaxId=x_lieux.length;} 
 	}

	var txtLie="";
	if (flowVueCtrl=="Lie") {
 		while ((flowVueCtrlId<x_lieux.length) && (nrow<maxRow)) {
			if (txtLie=="") txtLie="&Lieux=";
			txtLie += x_lieux[flowVueCtrlId].childNodes[1].firstChild.nodeValue + TB + getLieuNom(flowVueCtrlId) + TB + x_lieux[flowVueCtrlId].childNodes[3].firstChild.nodeValue + TB + x_lieux[flowVueCtrlId].childNodes[4].firstChild.nodeValue + TB + x_lieux[flowVueCtrlId].childNodes[5].firstChild.nodeValue + LF ;
			nrow++; 			
			flowVueCtrlId++;
 		}
 		if (flowVueCtrlId>=x_lieux.length) { flowVueCtrl="";  flowVueCtrlId=3; flow="END"; } 
 	}
	if (nrow<maxRow) flow="END"; 		// au cas ou il n'y a pas de lieux en vue!

	var data="&flow="+flow+"&VueId="+VueId+txtMon+txtTro+txtTre+txtCha+txtLie;
	if (flow=="END") {					// sur le dernier flux on envoi les données de positionnemetn!
		var vueHV=getPorteVue();
 		data='&Vue='+ZPOSX+TB+ZPOSY+TB+ZPOSN+TB+vueHV[0]+TB+vueHV[1]+TB+data;
		//alert(ZZDB+"/mzVision.php?"+data);
	}

	MZ_xmlhttpRequest({
		    method: 'GET',
		    url:  ZZDB+"/mzVision.php?"+data,
		    headers: {
		        'User-agent': 'Mozilla/4.0 (compatible) Mountyzilla',
		        'Accept': 'application/xml,text/xml',
		    },
		    onload: function(responseDetails) {
				try
					{
						var Id = responseDetails.responseText;
						if(Id.length==0) 
						{ 
							var arr = document.getElementsByName('sendZZVue');		// suppression du premier message
							arr[0].parentNode.removeChild(arr[0]);

							var myForm = document.createElement('span');
							myForm.appendChild(document.createTextNode(" Vue envoyée dans la DB ZZ!"));
							myForm.setAttribute('name', 'sendZZVue');

							// l'inserer après le bouton de Vue2D
							document.getElementsByTagName('form')[0].appendChild(myForm);

							return;				// fin du flux de donnée!
						}	else {
 							document.getElementsByName("sendZZVue")[0].childNodes[0].nodeValue=" Vue en cours d'envoi à ZZ: ("+flowVueCtrl+ ": "+flowVueCtrlId+" / "+flowVueCtrlMaxId+ ")";
 						}				

						sendVue(Id);							// envoyer la suite!!!
					}
					catch(e) {alert(e);} 
			}
		});

}  


//----------------------------------------------------------------------------------------------------
function putInfosVUE() { 
  // en fusion setInfosMonstres() est appelé dans le code MZ
  //if (listeCDM.length>0) setInfosMonstres();	// barre de PV et CdM
  //else delayInfosMonstres();				// on est passé avant MZ, on va attendre un peu
  setInfosMonstres(2) ; 
  setInfosTrolls();		// Coterie
  setInfosTresors();
  setInfosLieux();
  setInfosInfos();		// alerte
  requestTresors();		
  if (setInfosVue()) sendVue(0); else putSendVueBouton();					// // Gestionnaire de vue!!! ou Mettre un bouton pour forcer l'envoye de la vue 
}  


//----------------------------------------------------------------------------------------------------
// TABLES REPLIABLES Overided to be compliant with ZZ feature!
function toggleTableau(num) {
	if(cursorOnLink) return;

    var off=2;	  if (num==itinf) off=1;
    
    if (num==itmon) ttab=tmon;
    else if (num==ittro) ttab=ttro;
    else if (num==ittre) ttab=ttre;
    else if (num==itcha) ttab=tcha;
    else if (num==itlie) ttab=tlie;
    else if (num==itinf) ttab=tinf;
    else if (num==itbid) ttab=tbid;
    else ttab=totaltab[num];

	var tbody=ttab.childNodes[off];
	if(num==itinf)
	{
		MZ_setValue("INFOPLIE",!tbody.getAttribute('style') || tbody.getAttribute('style') == '');
		if(!tbody.getAttribute('style') || tbody.getAttribute('style') == '')
		{
			var vues = getPorteVue();
			var pos = getPosition();
			appendText(totaltab[num].childNodes[0].firstChild.firstChild," => Position : X = "+pos[0]+", Y = "+pos[1]+", N = "+pos[2]+" --- Vue : "+vues[0]+"/"+vues[1]+" ("+vues[2]+"/"+vues[3]+")",1);
		}
		else
		{
			texte = totaltab[num].childNodes[0].firstChild.firstChild.childNodes[1];
			texte.parentNode.removeChild(texte);
		}
			
	}
	tbody.setAttribute('style', !tbody.getAttribute('style') || tbody.getAttribute('style') == '' ? 'display:none;' : '');
}

//----------------------------------------------------------------------------------------------------	    
function creerZZThead( num ) { // correction Bug MZ => Pas de Pliage sur les liens
    var noeud = totaltab[num].childNodes[0].firstChild;
	var links=noeud.getElementsByTagName('a');
	for(var i=1;i<links.length;i++)	{
	 	links[i].addEventListener("mouseover", function() {cursorOnLink=true;},true);
	 	links[i].addEventListener("mouseout", function() {cursorOnLink=false;},true);
	}
}

//----------------------------------------------------------------------------------------------------
// Overided to be compliant with ZZ feature!
function getMonstrePosition(i) {
	var tds = x_monstres[i].childNodes;	
	var j = tds.length;
	return new Array(tds[j - 3].firstChild.nodeValue, tds[j - 2].firstChild.nodeValue, tds[j - 1].firstChild.nodeValue);
}

// Overided car diplo prise en compte par ZZ maintenant
function refreshDiplo() {
	if (setCheckBoxCookie(checkBoxDiplo, "NODIPLO")) {
		for (var i = nbTrolls+1; --i >= 3;) {
			x_trolls[i].style.backgroundColor = "";
			x_trolls[i].setAttribute('class', 'mh_tdpage');
		}
		return;
	}
	if (isDiploComputed == true) putRealDiplo();	
}
//----------------------------------------------------------------------------------------------------
var ZPOSX=MZ_getValue(numTroll+".position.X");
var ZPOSY=MZ_getValue(numTroll+".position.Y");
var ZPOSN=MZ_getValue(numTroll+".position.N");
var MM_TROLL = MZ_getValue("MM_TROLL");	


/*
var xz_monstres = tmon.childNodes[2];
var xz_trolls = ttro.childNodes[2];
var xz_tresors = ttre.childNodes[2];
var xz_champis = tcha.childNodes[2];
var xz_lieux = tlie.childNodes[2];
*/
// reconstruction des variables suivant l'ancien model!

//alert(x_monstres);


//var zz_trolls = new Array(); zz_trolls[0]=xz_trolls.childNodes[1];
//var j=1;  for (var i=3; i<xz_trolls.childNodes.length; i+=2) { zz_trolls[j]=xz_trolls.childNodes[i];   j=j+1; }

//var zz_tresors = new Array(); zz_tresors[0]=xz_tresors.childNodes[1];
//var j=1;  for (var i=3; i<xz_tresors.childNodes.length; i+=2) { zz_tresors[j]=xz_tresors.childNodes[i];   j=j+1; }

//var zz_champis = new Array(); zz_champis[0]=xz_champis.childNodes[1];
//var j=1;  for (var i=3; i<xz_champis.childNodes.length; i+=2) { zz_champis[j]=xz_champis.childNodes[i];   j=j+1; }

//var zz_lieux = new Array(); zz_lieux[0]=xz_lieux.childNodes[1];
//var j=1;  for (var i=3; i<xz_lieux.childNodes.length; i+=2) { zz_lieux[j]=xz_lieux.childNodes[i];   j=j+1; }


creerZZThead( itmon ); creerZZThead( ittro ); creerZZThead( ittre ); creerZZThead( itcha ); creerZZThead( itlie );
putMsgPXBouton(ttro);		// les bouton de distribution de PX, MP et partage


// pour recalification des pointeurs sur MZ
//var x_trolls = new Array(); x_trolls[0]=zz_trolls[0]; x_trolls[1]=zz_trolls[0]; x_trolls[2]=zz_trolls[0];
//var j=3;  for (var i=1; i<zz_trolls.length; i+=1) { x_trolls[j]=zz_trolls[i];   j=j+1; }

//var x_tresors = new Array(); x_tresors[0]=zz_tresors[0]; x_tresors[1]=zz_tresors[0]; x_tresors[2]=zz_tresors[0];
//var j=3;  for (var i=1; i<zz_tresors.length; i+=1) { x_tresors[j]=zz_tresors[i];   j=j+1; }

//var x_champis = new Array(); x_champis[0]=zz_champis[0]; x_champis[1]=zz_champis[0]; x_champis[2]=zz_champis[0];
//var j=3;  for (var i=1; i<zz_champis.length; i+=1) { x_champis[j]=zz_champis[i];   j=j+1; }

//var x_lieux = new Array(); x_lieux[0]=zz_lieux[0]; x_lieux[1]=zz_lieux[0]; x_lieux[2]=zz_lieux[0];
//var j=3;  for (var i=1; i<zz_lieux.length; i+=1) { x_lieux[j]=zz_lieux[i];   j=j+1; }
//nbLieux=nbLieux-1;

//recherche des monstres à proximité (pour insultes)
for (var i = 3; i < x_monstres.length; i++) {

	if (getMonstreDistance(i) <= ZMON) {
 		idMonstres+='&MeID[]='+getMonstreID(i);
 	} else break;
}

//alert(ZZDB+"/mzVue.php?&num="+numTroll+"&X="+ZPOSX+"&Y="+ZPOSY+"&N="+ZPOSN+idMonstres+ZPREF);
MZ_xmlhttpRequest({
				method: 'GET',
				url: ZZDB+"/mzVue.php?&num="+numTroll+"&X="+ZPOSX+"&Y="+ZPOSY+"&N="+ZPOSN+idMonstres+ZPREF,	
				headers : {
					'User-agent': 'Mozilla/4.0 [FusionZoryaZilla] (compatible) Greasemonkey',
					'Accept': 'application/atom+xml,application/xml,text/xml'
				},
				onload: function(responseDetails) {
					try
					{
						var texte = responseDetails.responseText;

						var lines = texte.split(";");
						if(lines.length==0)
							return;
						for(var j=0;j<lines.length;j++)
						{
								var  xl = lines[j].split("]=");
								if (xl.length==2) 
								{
									var varname=xl[0].substr(0,xl[0].indexOf("["));
								    //var idx=xl[0].slice(xl[0].indexOf("[")+1, xl[0].indexOf("]"));
								    var idx=xl[0].substr(xl[0].indexOf("[")+1);
									var xv=xl[1].slice(xl[1].indexOf('("')+2, xl[1].length-1);
									var values=xv.split('","');
									var val=xl[1].substr(1, xl[1].length-2);
									if (varname=="infosTrolls") {
	 									infosTrolls[idx]=values;
	 								} else if (varname=="gogo") {
	 									gogo[idx]=values;
	 								} else if (varname=="fam") {
	 									fam[idx]=values;
	 								} else if (varname=="infosPieges") {
	 									infosPieges[idx]=values;
	 								} else if (varname=="MeInsulte") {
	 									MeInsulte[idx]=values;
	 								} else if (varname=="infosVue") {
	 									infosVue[idx]=values;
	 								} else if (varname=="cg") {
	 									cg[idx]=val;
	 								} else if (varname=="ct") {
	 									ct[idx]=val;
	 								} 
								} 
						}
						isDiploComputed = true;
	 					putInfosVUE(); 
					}
					catch(e)
					{
						alert("mzVue: "+e+"/"+url);
					} 
				}
				});



