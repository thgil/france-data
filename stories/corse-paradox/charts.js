/* charts.js — corse-paradox story */

const DEPTS = [{"dept":"2B","name":"Haute-Corse","bars":390,"pop":184655,"ratio":2.112,"pct_desert":11.6,"apl0_count":116,"apl0_pct":49.2,"n_communes":236,"corsica":true},{"dept":"48","name":"Lozère","bars":135,"pop":76519,"ratio":1.764,"pct_desert":33.5,"apl0_count":19,"apl0_pct":12.5,"n_communes":152,"corsica":false},{"dept":"2A","name":"Corse-du-Sud","bars":276,"pop":162942,"ratio":1.694,"pct_desert":12.3,"apl0_count":30,"apl0_pct":24.2,"n_communes":124,"corsica":true},{"dept":"15","name":"Cantal","bars":239,"pop":144226,"ratio":1.657,"pct_desert":10.8,"apl0_count":16,"apl0_pct":6.4,"n_communes":250,"corsica":false},{"dept":"05","name":"Hautes-Alpes","bars":220,"pop":140976,"ratio":1.561,"pct_desert":7.8,"apl0_count":11,"apl0_pct":6.8,"n_communes":162,"corsica":false},{"dept":"04","name":"Alpes-de-Haute-Provence","bars":243,"pop":166077,"ratio":1.463,"pct_desert":10.9,"apl0_count":19,"apl0_pct":9.6,"n_communes":198,"corsica":false},{"dept":"75","name":"Paris","bars":3121,"pop":2133111,"ratio":1.463,"pct_desert":0.0,"apl0_count":1,"apl0_pct":4.8,"n_communes":21,"corsica":false},{"dept":"22","name":"Côtes-d'Armor","bars":787,"pop":604489,"ratio":1.302,"pct_desert":16.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":344,"corsica":false},{"dept":"73","name":"Savoie","bars":539,"pop":442468,"ratio":1.218,"pct_desert":8.7,"apl0_count":7,"apl0_pct":2.6,"n_communes":273,"corsica":false},{"dept":"56","name":"Morbihan","bars":931,"pop":768687,"ratio":1.211,"pct_desert":7.1,"apl0_count":3,"apl0_pct":1.2,"n_communes":249,"corsica":false},{"dept":"58","name":"Nièvre","bars":245,"pop":202417,"ratio":1.21,"pct_desert":37.2,"apl0_count":3,"apl0_pct":1.0,"n_communes":309,"corsica":false},{"dept":"43","name":"Haute-Loire","bars":273,"pop":227284,"ratio":1.201,"pct_desert":16.0,"apl0_count":17,"apl0_pct":6.6,"n_communes":257,"corsica":false},{"dept":"23","name":"Creuse","bars":128,"pop":115596,"ratio":1.107,"pct_desert":26.7,"apl0_count":3,"apl0_pct":1.2,"n_communes":255,"corsica":false},{"dept":"29","name":"Finistère","bars":1014,"pop":921638,"ratio":1.1,"pct_desert":5.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":277,"corsica":false},{"dept":"12","name":"Aveyron","bars":297,"pop":278076,"ratio":1.068,"pct_desert":13.7,"apl0_count":15,"apl0_pct":5.3,"n_communes":285,"corsica":false},{"dept":"07","name":"Ardèche","bars":352,"pop":331415,"ratio":1.062,"pct_desert":27.4,"apl0_count":25,"apl0_pct":7.5,"n_communes":335,"corsica":false},{"dept":"42","name":"Loire","bars":784,"pop":768608,"ratio":1.02,"pct_desert":12.7,"apl0_count":2,"apl0_pct":0.6,"n_communes":320,"corsica":false},{"dept":"50","name":"Manche","bars":504,"pop":495508,"ratio":1.017,"pct_desert":24.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":445,"corsica":false},{"dept":"19","name":"Corrèze","bars":239,"pop":239129,"ratio":0.999,"pct_desert":17.6,"apl0_count":10,"apl0_pct":3.6,"n_communes":277,"corsica":false},{"dept":"36","name":"Indre","bars":213,"pop":217228,"ratio":0.981,"pct_desert":37.3,"apl0_count":0,"apl0_pct":0.0,"n_communes":241,"corsica":false},{"dept":"08","name":"Ardennes","bars":259,"pop":268847,"ratio":0.963,"pct_desert":14.5,"apl0_count":0,"apl0_pct":0.0,"n_communes":447,"corsica":false},{"dept":"14","name":"Calvados","bars":669,"pop":696164,"ratio":0.961,"pct_desert":7.0,"apl0_count":1,"apl0_pct":0.2,"n_communes":526,"corsica":false},{"dept":"24","name":"Dordogne","bars":397,"pop":413730,"ratio":0.96,"pct_desert":21.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":503,"corsica":false},{"dept":"83","name":"Var","bars":1042,"pop":1095337,"ratio":0.951,"pct_desert":8.1,"apl0_count":4,"apl0_pct":2.6,"n_communes":153,"corsica":false},{"dept":"64","name":"Pyrénées-Atlantiques","bars":652,"pop":693027,"ratio":0.941,"pct_desert":5.5,"apl0_count":3,"apl0_pct":0.6,"n_communes":545,"corsica":false},{"dept":"74","name":"Haute-Savoie","bars":788,"pop":841482,"ratio":0.936,"pct_desert":24.0,"apl0_count":3,"apl0_pct":1.1,"n_communes":279,"corsica":false},{"dept":"06","name":"Alpes-Maritimes","bars":1004,"pop":1103941,"ratio":0.909,"pct_desert":3.6,"apl0_count":36,"apl0_pct":22.1,"n_communes":163,"corsica":false},{"dept":"17","name":"Charente-Maritime","bars":601,"pop":661173,"ratio":0.909,"pct_desert":7.7,"apl0_count":0,"apl0_pct":0.0,"n_communes":462,"corsica":false},{"dept":"88","name":"Vosges","bars":325,"pop":360359,"ratio":0.902,"pct_desert":11.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":506,"corsica":false},{"dept":"65","name":"Hautes-Pyrénées","bars":207,"pop":230956,"ratio":0.896,"pct_desert":12.2,"apl0_count":3,"apl0_pct":0.6,"n_communes":469,"corsica":false},{"dept":"03","name":"Allier","bars":294,"pop":334872,"ratio":0.878,"pct_desert":20.8,"apl0_count":3,"apl0_pct":0.9,"n_communes":317,"corsica":false},{"dept":"63","name":"Puy-de-Dôme","bars":581,"pop":661940,"ratio":0.878,"pct_desert":9.3,"apl0_count":10,"apl0_pct":2.2,"n_communes":463,"corsica":false},{"dept":"62","name":"Pas-de-Calais","bars":1263,"pop":1459154,"ratio":0.866,"pct_desert":5.8,"apl0_count":0,"apl0_pct":0.0,"n_communes":887,"corsica":false},{"dept":"18","name":"Cher","bars":255,"pop":299573,"ratio":0.851,"pct_desert":57.7,"apl0_count":0,"apl0_pct":0.0,"n_communes":286,"corsica":false},{"dept":"85","name":"Vendée","bars":588,"pop":696957,"ratio":0.844,"pct_desert":29.4,"apl0_count":0,"apl0_pct":0.0,"n_communes":253,"corsica":false},{"dept":"34","name":"Hérault","bars":1013,"pop":1201734,"ratio":0.843,"pct_desert":4.0,"apl0_count":4,"apl0_pct":1.2,"n_communes":341,"corsica":false},{"dept":"26","name":"Drôme","bars":436,"pop":519417,"ratio":0.839,"pct_desert":9.2,"apl0_count":26,"apl0_pct":7.2,"n_communes":362,"corsica":false},{"dept":"80","name":"Somme","bars":473,"pop":566005,"ratio":0.836,"pct_desert":4.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":771,"corsica":false},{"dept":"40","name":"Landes","bars":353,"pop":422976,"ratio":0.835,"pct_desert":3.4,"apl0_count":2,"apl0_pct":0.6,"n_communes":327,"corsica":false},{"dept":"35","name":"Ille-et-Vilaine","bars":914,"pop":1098325,"ratio":0.832,"pct_desert":10.3,"apl0_count":0,"apl0_pct":0.0,"n_communes":332,"corsica":false},{"dept":"11","name":"Aude","bars":311,"pop":376028,"ratio":0.827,"pct_desert":13.1,"apl0_count":38,"apl0_pct":8.8,"n_communes":433,"corsica":false},{"dept":"76","name":"Seine-Maritime","bars":1017,"pop":1255669,"ratio":0.81,"pct_desert":7.4,"apl0_count":0,"apl0_pct":0.0,"n_communes":707,"corsica":false},{"dept":"53","name":"Mayenne","bars":246,"pop":305933,"ratio":0.804,"pct_desert":38.5,"apl0_count":0,"apl0_pct":0.0,"n_communes":240,"corsica":false},{"dept":"84","name":"Vaucluse","bars":452,"pop":564566,"ratio":0.801,"pct_desert":6.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":151,"corsica":false},{"dept":"41","name":"Loir-et-Cher","bars":262,"pop":328504,"ratio":0.798,"pct_desert":30.5,"apl0_count":0,"apl0_pct":0.0,"n_communes":267,"corsica":false},{"dept":"66","name":"Pyrénées-Orientales","bars":389,"pop":487307,"ratio":0.798,"pct_desert":6.2,"apl0_count":25,"apl0_pct":11.1,"n_communes":226,"corsica":false},{"dept":"13","name":"Bouches-du-Rhône","bars":1632,"pop":2056943,"ratio":0.793,"pct_desert":1.5,"apl0_count":1,"apl0_pct":0.7,"n_communes":135,"corsica":false},{"dept":"46","name":"Lot","bars":136,"pop":174515,"ratio":0.779,"pct_desert":17.4,"apl0_count":6,"apl0_pct":1.9,"n_communes":312,"corsica":false},{"dept":"39","name":"Jura","bars":199,"pop":258118,"ratio":0.771,"pct_desert":12.4,"apl0_count":0,"apl0_pct":0.0,"n_communes":492,"corsica":false},{"dept":"89","name":"Yonne","bars":256,"pop":333385,"ratio":0.768,"pct_desert":39.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":423,"corsica":false},{"dept":"30","name":"Gard","bars":578,"pop":756394,"ratio":0.764,"pct_desert":9.2,"apl0_count":15,"apl0_pct":4.3,"n_communes":350,"corsica":false},{"dept":"61","name":"Orne","bars":210,"pop":276283,"ratio":0.76,"pct_desert":29.6,"apl0_count":0,"apl0_pct":0.0,"n_communes":381,"corsica":false},{"dept":"59","name":"Nord","bars":1960,"pop":2610915,"ratio":0.751,"pct_desert":2.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":647,"corsica":false},{"dept":"32","name":"Gers","bars":144,"pop":192235,"ratio":0.749,"pct_desert":16.1,"apl0_count":0,"apl0_pct":0.0,"n_communes":458,"corsica":false},{"dept":"27","name":"Eure","bars":441,"pop":598934,"ratio":0.736,"pct_desert":45.4,"apl0_count":0,"apl0_pct":0.0,"n_communes":585,"corsica":false},{"dept":"37","name":"Indre-et-Loire","bars":448,"pop":612160,"ratio":0.732,"pct_desert":2.6,"apl0_count":0,"apl0_pct":0.0,"n_communes":272,"corsica":false},{"dept":"57","name":"Moselle","bars":765,"pop":1049942,"ratio":0.729,"pct_desert":15.5,"apl0_count":1,"apl0_pct":0.1,"n_communes":725,"corsica":false},{"dept":"09","name":"Ariège","bars":112,"pop":154588,"ratio":0.725,"pct_desert":9.8,"apl0_count":13,"apl0_pct":4.0,"n_communes":325,"corsica":false},{"dept":"02","name":"Aisne","bars":378,"pop":527349,"ratio":0.717,"pct_desert":27.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":797,"corsica":false},{"dept":"38","name":"Isère","bars":915,"pop":1284948,"ratio":0.712,"pct_desert":11.8,"apl0_count":12,"apl0_pct":2.3,"n_communes":512,"corsica":false},{"dept":"71","name":"Saône-et-Loire","bars":389,"pop":548407,"ratio":0.709,"pct_desert":35.8,"apl0_count":2,"apl0_pct":0.4,"n_communes":563,"corsica":false},{"dept":"49","name":"Maine-et-Loire","bars":572,"pop":808034,"ratio":0.708,"pct_desert":7.5,"apl0_count":1,"apl0_pct":0.6,"n_communes":176,"corsica":false},{"dept":"87","name":"Haute-Vienne","bars":261,"pop":371691,"ratio":0.702,"pct_desert":5.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":195,"corsica":false},{"dept":"79","name":"Deux-Sèvres","bars":257,"pop":373820,"ratio":0.687,"pct_desert":29.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":252,"corsica":false},{"dept":"72","name":"Sarthe","bars":387,"pop":563497,"ratio":0.687,"pct_desert":35.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":352,"corsica":false},{"dept":"44","name":"Loire-Atlantique","bars":988,"pop":1457806,"ratio":0.678,"pct_desert":8.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":207,"corsica":false},{"dept":"69","name":"Rhône","bars":1239,"pop":1889717,"ratio":0.656,"pct_desert":5.8,"apl0_count":2,"apl0_pct":0.7,"n_communes":275,"corsica":false},{"dept":"47","name":"Lot-et-Garonne","bars":213,"pop":331229,"ratio":0.643,"pct_desert":25.9,"apl0_count":2,"apl0_pct":0.6,"n_communes":319,"corsica":false},{"dept":"55","name":"Meuse","bars":116,"pop":181919,"ratio":0.638,"pct_desert":15.1,"apl0_count":7,"apl0_pct":1.4,"n_communes":499,"corsica":false},{"dept":"51","name":"Marne","bars":360,"pop":565021,"ratio":0.637,"pct_desert":7.5,"apl0_count":1,"apl0_pct":0.2,"n_communes":610,"corsica":false},{"dept":"86","name":"Vienne","bars":274,"pop":439385,"ratio":0.624,"pct_desert":6.5,"apl0_count":0,"apl0_pct":0.0,"n_communes":265,"corsica":false},{"dept":"60","name":"Oise","bars":507,"pop":828838,"ratio":0.612,"pct_desert":28.6,"apl0_count":0,"apl0_pct":0.0,"n_communes":680,"corsica":false},{"dept":"82","name":"Tarn-et-Garonne","bars":159,"pop":263377,"ratio":0.604,"pct_desert":19.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":195,"corsica":false},{"dept":"16","name":"Charente","bars":211,"pop":349796,"ratio":0.603,"pct_desert":14.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":359,"corsica":false},{"dept":"28","name":"Eure-et-Loir","bars":259,"pop":430976,"ratio":0.601,"pct_desert":55.6,"apl0_count":0,"apl0_pct":0.0,"n_communes":363,"corsica":false},{"dept":"21","name":"Côte-d'Or","bars":320,"pop":535503,"ratio":0.598,"pct_desert":9.8,"apl0_count":3,"apl0_pct":0.4,"n_communes":698,"corsica":false},{"dept":"10","name":"Aube","bars":184,"pop":311329,"ratio":0.591,"pct_desert":28.8,"apl0_count":0,"apl0_pct":0.0,"n_communes":431,"corsica":false},{"dept":"25","name":"Doubs","bars":308,"pop":545409,"ratio":0.565,"pct_desert":8.2,"apl0_count":6,"apl0_pct":1.1,"n_communes":563,"corsica":false},{"dept":"33","name":"Gironde","bars":921,"pop":1654884,"ratio":0.557,"pct_desert":3.5,"apl0_count":1,"apl0_pct":0.2,"n_communes":534,"corsica":false},{"dept":"45","name":"Loiret","bars":379,"pop":684561,"ratio":0.554,"pct_desert":38.8,"apl0_count":0,"apl0_pct":0.0,"n_communes":325,"corsica":false},{"dept":"81","name":"Tarn","bars":218,"pop":393572,"ratio":0.554,"pct_desert":17.2,"apl0_count":2,"apl0_pct":0.6,"n_communes":314,"corsica":false},{"dept":"54","name":"Meurthe-et-Moselle","bars":403,"pop":732486,"ratio":0.55,"pct_desert":11.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":591,"corsica":false},{"dept":"68","name":"Haut-Rhin","bars":414,"pop":767083,"ratio":0.54,"pct_desert":12.3,"apl0_count":0,"apl0_pct":0.0,"n_communes":366,"corsica":false},{"dept":"70","name":"Haute-Saône","bars":126,"pop":234010,"ratio":0.538,"pct_desert":11.2,"apl0_count":1,"apl0_pct":0.2,"n_communes":536,"corsica":false},{"dept":"52","name":"Haute-Marne","bars":90,"pop":171042,"ratio":0.526,"pct_desert":21.4,"apl0_count":4,"apl0_pct":0.9,"n_communes":426,"corsica":false},{"dept":"93","name":"Seine-Saint-Denis","bars":856,"pop":1636291,"ratio":0.523,"pct_desert":12.9,"apl0_count":0,"apl0_pct":0.0,"n_communes":39,"corsica":false},{"dept":"01","name":"Ain","bars":329,"pop":663025,"ratio":0.496,"pct_desert":41.8,"apl0_count":5,"apl0_pct":1.3,"n_communes":391,"corsica":false},{"dept":"90","name":"Territoire de Belfort","bars":65,"pop":139654,"ratio":0.465,"pct_desert":20.0,"apl0_count":0,"apl0_pct":0.0,"n_communes":101,"corsica":false},{"dept":"31","name":"Haute-Garonne","bars":602,"pop":1434367,"ratio":0.42,"pct_desert":2.6,"apl0_count":4,"apl0_pct":0.7,"n_communes":586,"corsica":false},{"dept":"94","name":"Val-de-Marne","bars":565,"pop":1415367,"ratio":0.399,"pct_desert":12.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":47,"corsica":false},{"dept":"67","name":"Bas-Rhin","bars":450,"pop":1152662,"ratio":0.39,"pct_desert":3.4,"apl0_count":0,"apl0_pct":0.0,"n_communes":514,"corsica":false},{"dept":"77","name":"Seine-et-Marne","bars":547,"pop":1438100,"ratio":0.38,"pct_desert":54.1,"apl0_count":0,"apl0_pct":0.0,"n_communes":507,"corsica":false},{"dept":"95","name":"Val-d'Oise","bars":463,"pop":1256607,"ratio":0.368,"pct_desert":63.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":183,"corsica":false},{"dept":"92","name":"Hauts-de-Seine","bars":546,"pop":1635291,"ratio":0.334,"pct_desert":17.2,"apl0_count":0,"apl0_pct":0.0,"n_communes":36,"corsica":false},{"dept":"78","name":"Yvelines","bars":478,"pop":1456365,"ratio":0.328,"pct_desert":38.1,"apl0_count":0,"apl0_pct":0.0,"n_communes":259,"corsica":false},{"dept":"91","name":"Essonne","bars":403,"pop":1313768,"ratio":0.307,"pct_desert":51.3,"apl0_count":0,"apl0_pct":0.0,"n_communes":194,"corsica":false}];
const CORSE_COMMS = [{"name":"Ajaccio","dept":"2A","pop":73822,"bars":83,"bars_r":1.12,"apl":3.9,"cat":"adequate"},{"name":"Bastia","dept":"2B","pop":48768,"bars":105,"bars_r":2.15,"apl":4.02,"cat":"well-served"},{"name":"Porto-Vecchio","dept":"2A","pop":11229,"bars":35,"bars_r":3.12,"apl":6.55,"cat":"well-served"},{"name":"Borgo","dept":"2B","pop":9678,"bars":2,"bars_r":0.21,"apl":3.38,"cat":"adequate"},{"name":"Biguglia","dept":"2B","pop":7654,"bars":6,"bars_r":0.78,"apl":2.02,"cat":"desert"},{"name":"Corte","dept":"2B","pop":7654,"bars":26,"bars_r":3.4,"apl":5.04,"cat":"well-served"},{"name":"Lucciana","dept":"2B","pop":6091,"bars":13,"bars_r":2.13,"apl":4.46,"cat":"well-served"},{"name":"Furiani","dept":"2B","pop":6032,"bars":0,"bars_r":0.0,"apl":2.96,"cat":"adequate"},{"name":"Calvi","dept":"2B","pop":5746,"bars":25,"bars_r":4.35,"apl":4.71,"cat":"well-served"},{"name":"Bastelicaccia","dept":"2A","pop":4251,"bars":0,"bars_r":0.0,"apl":2.76,"cat":"adequate"},{"name":"Ghisonaccia","dept":"2B","pop":4248,"bars":9,"bars_r":2.12,"apl":4.46,"cat":"well-served"},{"name":"Propriano","dept":"2A","pop":3741,"bars":13,"bars_r":3.48,"apl":4.96,"cat":"well-served"},{"name":"Prunelli-di-Fiumorbo","dept":"2B","pop":3737,"bars":7,"bars_r":1.87,"apl":6.48,"cat":"well-served"},{"name":"Alata","dept":"2A","pop":3587,"bars":4,"bars_r":1.12,"apl":1.26,"cat":"desert"},{"name":"Sartène","dept":"2A","pop":3570,"bars":8,"bars_r":2.24,"apl":4.94,"cat":"well-served"},{"name":"Penta-di-Casinca","dept":"2B","pop":3376,"bars":6,"bars_r":1.78,"apl":7.0,"cat":"well-served"},{"name":"Grosseto-Prugna","dept":"2A","pop":3349,"bars":3,"bars_r":0.9,"apl":5.95,"cat":"well-served"},{"name":"Afa","dept":"2A","pop":3336,"bars":1,"bars_r":0.3,"apl":1.78,"cat":"desert"},{"name":"Sarrola-Carcopino","dept":"2A","pop":3278,"bars":1,"bars_r":0.31,"apl":3.22,"cat":"adequate"},{"name":"Ville-di-Pietrabugno","dept":"2B","pop":3232,"bars":2,"bars_r":0.62,"apl":2.59,"cat":"adequate"},{"name":"L'Île-Rousse","dept":"2B","pop":3220,"bars":11,"bars_r":3.42,"apl":4.69,"cat":"well-served"},{"name":"Vescovato","dept":"2B","pop":3212,"bars":4,"bars_r":1.25,"apl":6.92,"cat":"well-served"},{"name":"Bonifacio","dept":"2A","pop":3200,"bars":12,"bars_r":3.75,"apl":5.33,"cat":"well-served"},{"name":"San-Martino-di-Lota","dept":"2B","pop":2936,"bars":2,"bars_r":0.68,"apl":3.58,"cat":"adequate"},{"name":"Zonza","dept":"2A","pop":2748,"bars":6,"bars_r":2.18,"apl":5.13,"cat":"well-served"},{"name":"Calenzana","dept":"2B","pop":2566,"bars":4,"bars_r":1.56,"apl":2.94,"cat":"adequate"},{"name":"Ventiseri","dept":"2B","pop":2556,"bars":5,"bars_r":1.96,"apl":1.44,"cat":"desert"},{"name":"Aléria","dept":"2B","pop":2211,"bars":3,"bars_r":1.36,"apl":5.47,"cat":"well-served"},{"name":"Cervione","dept":"2B","pop":2172,"bars":4,"bars_r":1.84,"apl":3.9,"cat":"adequate"},{"name":"Peri","dept":"2A","pop":2040,"bars":2,"bars_r":0.98,"apl":1.91,"cat":"desert"},{"name":"San-Nicolao","dept":"2B","pop":2033,"bars":6,"bars_r":2.95,"apl":3.68,"cat":"adequate"},{"name":"Cuttoli-Corticchiato","dept":"2A","pop":2030,"bars":0,"bars_r":0.0,"apl":1.91,"cat":"desert"},{"name":"Monticello","dept":"2B","pop":2029,"bars":0,"bars_r":0.0,"apl":4.69,"cat":"well-served"},{"name":"Pietrosella","dept":"2A","pop":1968,"bars":0,"bars_r":0.0,"apl":0.8,"cat":"severe"},{"name":"Santa-Maria-di-Lota","dept":"2B","pop":1965,"bars":1,"bars_r":0.51,"apl":1.82,"cat":"desert"},{"name":"Lecci","dept":"2A","pop":1939,"bars":2,"bars_r":1.03,"apl":4.78,"cat":"well-served"},{"name":"Venzolasca","dept":"2B","pop":1808,"bars":1,"bars_r":0.55,"apl":6.01,"cat":"well-served"},{"name":"Oletta","dept":"2B","pop":1801,"bars":1,"bars_r":0.56,"apl":5.68,"cat":"well-served"},{"name":"Albitreccia","dept":"2A","pop":1775,"bars":1,"bars_r":0.56,"apl":5.38,"cat":"well-served"},{"name":"Appietto","dept":"2A","pop":1773,"bars":0,"bars_r":0.0,"apl":0.45,"cat":"severe"},{"name":"Sotta","dept":"2A","pop":1711,"bars":1,"bars_r":0.58,"apl":4.17,"cat":"well-served"},{"name":"Saint-Florent","dept":"2B","pop":1689,"bars":16,"bars_r":9.47,"apl":7.42,"cat":"well-served"},{"name":"Figari","dept":"2A","pop":1651,"bars":2,"bars_r":1.21,"apl":1.79,"cat":"desert"},{"name":"Brando","dept":"2B","pop":1580,"bars":2,"bars_r":1.27,"apl":2.21,"cat":"desert"},{"name":"Santa-Lucia-di-Moriani","dept":"2B","pop":1523,"bars":2,"bars_r":1.31,"apl":3.68,"cat":"adequate"},{"name":"Cauro","dept":"2A","pop":1481,"bars":0,"bars_r":0.0,"apl":3.27,"cat":"adequate"},{"name":"Sari-Solenzara","dept":"2A","pop":1429,"bars":5,"bars_r":3.5,"apl":9.47,"cat":"well-served"},{"name":"Eccica-Suarella","dept":"2A","pop":1357,"bars":0,"bars_r":0.0,"apl":1.63,"cat":"desert"},{"name":"Olmeto","dept":"2A","pop":1241,"bars":3,"bars_r":2.42,"apl":3.32,"cat":"adequate"},{"name":"Cargèse","dept":"2A","pop":1237,"bars":5,"bars_r":4.04,"apl":14.19,"cat":"well-served"},{"name":"Lumio","dept":"2B","pop":1214,"bars":1,"bars_r":0.82,"apl":5.46,"cat":"well-served"},{"name":"Sisco","dept":"2B","pop":1162,"bars":3,"bars_r":2.58,"apl":0.79,"cat":"severe"},{"name":"Conca","dept":"2A","pop":1159,"bars":3,"bars_r":2.59,"apl":0.71,"cat":"severe"},{"name":"San-Gavino-di-Carbini","dept":"2A","pop":1120,"bars":0,"bars_r":0.0,"apl":6.05,"cat":"well-served"},{"name":"Linguizzetta","dept":"2B","pop":1103,"bars":1,"bars_r":0.91,"apl":0,"cat":"severe"},{"name":"Santa-Reparata-di-Balagna","dept":"2B","pop":1004,"bars":3,"bars_r":2.99,"apl":5.04,"cat":"well-served"},{"name":"Vico","dept":"2A","pop":968,"bars":6,"bars_r":6.2,"apl":7.24,"cat":"well-served"},{"name":"Morosaglia","dept":"2B","pop":963,"bars":6,"bars_r":6.23,"apl":8.39,"cat":"well-served"},{"name":"Corbara","dept":"2B","pop":922,"bars":1,"bars_r":1.08,"apl":5.39,"cat":"well-served"},{"name":"Sorbo-Ocagnano","dept":"2B","pop":892,"bars":1,"bars_r":1.12,"apl":7.66,"cat":"well-served"},{"name":"Patrimonio","dept":"2B","pop":877,"bars":0,"bars_r":0.0,"apl":6.13,"cat":"well-served"},{"name":"Viggianello","dept":"2A","pop":872,"bars":1,"bars_r":1.15,"apl":3.58,"cat":"adequate"},{"name":"Luri","dept":"2B","pop":853,"bars":2,"bars_r":2.34,"apl":5.16,"cat":"well-served"},{"name":"Pianottoli-Caldarello","dept":"2A","pop":851,"bars":3,"bars_r":3.53,"apl":1.52,"cat":"desert"},{"name":"Talasani","dept":"2B","pop":827,"bars":1,"bars_r":1.21,"apl":1.38,"cat":"desert"},{"name":"Santa-Maria-Poggio","dept":"2B","pop":792,"bars":1,"bars_r":1.26,"apl":4.59,"cat":"well-served"},{"name":"Coggia","dept":"2A","pop":765,"bars":1,"bars_r":1.31,"apl":4.95,"cat":"well-served"},{"name":"San-Giuliano","dept":"2B","pop":764,"bars":1,"bars_r":1.31,"apl":3.9,"cat":"adequate"},{"name":"Poggio-Mezzana","dept":"2B","pop":761,"bars":1,"bars_r":1.31,"apl":1.38,"cat":"desert"},{"name":"Solaro","dept":"2B","pop":732,"bars":2,"bars_r":2.73,"apl":7.38,"cat":"well-served"},{"name":"Coti-Chiavari","dept":"2A","pop":725,"bars":1,"bars_r":1.38,"apl":2.39,"cat":"desert"},{"name":"Moltifao","dept":"2B","pop":714,"bars":1,"bars_r":1.4,"apl":0,"cat":"severe"},{"name":"Belgodère","dept":"2B","pop":707,"bars":2,"bars_r":2.83,"apl":1.45,"cat":"desert"},{"name":"Castellare-di-Casinca","dept":"2B","pop":706,"bars":1,"bars_r":1.42,"apl":7.24,"cat":"well-served"},{"name":"Levie","dept":"2A","pop":675,"bars":6,"bars_r":8.89,"apl":4.96,"cat":"well-served"},{"name":"Venaco","dept":"2B","pop":666,"bars":2,"bars_r":3.0,"apl":2.44,"cat":"desert"},{"name":"Pietracorbara","dept":"2B","pop":653,"bars":3,"bars_r":4.59,"apl":2.09,"cat":"desert"},{"name":"Serra-di-Ferro","dept":"2A","pop":636,"bars":5,"bars_r":7.86,"apl":5.56,"cat":"well-served"},{"name":"Ocana","dept":"2A","pop":630,"bars":0,"bars_r":0.0,"apl":0.58,"cat":"severe"},{"name":"Monte","dept":"2B","pop":630,"bars":1,"bars_r":1.59,"apl":0,"cat":"severe"},{"name":"Vero","dept":"2A","pop":617,"bars":2,"bars_r":3.24,"apl":0,"cat":"severe"},{"name":"Omessa","dept":"2B","pop":600,"bars":1,"bars_r":1.67,"apl":1.58,"cat":"desert"},{"name":"Aregno","dept":"2B","pop":595,"bars":1,"bars_r":1.68,"apl":2.5,"cat":"adequate"},{"name":"Taglio-Isolaccio","dept":"2B","pop":595,"bars":1,"bars_r":1.68,"apl":0,"cat":"severe"},{"name":"Antisanti","dept":"2B","pop":568,"bars":1,"bars_r":1.76,"apl":0,"cat":"severe"},{"name":"Murato","dept":"2B","pop":567,"bars":2,"bars_r":3.53,"apl":1.29,"cat":"desert"},{"name":"Petreto-Bicchisano","dept":"2A","pop":562,"bars":2,"bars_r":3.56,"apl":2.57,"cat":"adequate"},{"name":"Monacia-d'Aullène","dept":"2A","pop":554,"bars":2,"bars_r":3.61,"apl":1.47,"cat":"desert"},{"name":"Olmeta-di-Tuda","dept":"2B","pop":543,"bars":1,"bars_r":1.84,"apl":4.72,"cat":"well-served"},{"name":"Rogliano","dept":"2B","pop":540,"bars":7,"bars_r":12.96,"apl":7.39,"cat":"well-served"},{"name":"Valle-di-Mezzana","dept":"2A","pop":538,"bars":0,"bars_r":0.0,"apl":3.22,"cat":"adequate"},{"name":"Bastelica","dept":"2A","pop":511,"bars":2,"bars_r":3.91,"apl":6.03,"cat":"well-served"},{"name":"Calcatoggio","dept":"2A","pop":507,"bars":0,"bars_r":0.0,"apl":7.84,"cat":"well-served"},{"name":"Castello-di-Rostino","dept":"2B","pop":504,"bars":0,"bars_r":0.0,"apl":5.59,"cat":"well-served"},{"name":"Ucciani","dept":"2A","pop":502,"bars":3,"bars_r":5.98,"apl":1.27,"cat":"desert"},{"name":"Pietralba","dept":"2B","pop":500,"bars":1,"bars_r":2.0,"apl":0,"cat":"severe"},{"name":"Ota","dept":"2A","pop":491,"bars":3,"bars_r":6.11,"apl":5.82,"cat":"well-served"},{"name":"Rutali","dept":"2B","pop":466,"bars":1,"bars_r":2.15,"apl":1.29,"cat":"desert"},{"name":"Piana","dept":"2A","pop":463,"bars":3,"bars_r":6.48,"apl":0,"cat":"severe"},{"name":"Casaglione","dept":"2A","pop":447,"bars":2,"bars_r":4.47,"apl":5.22,"cat":"well-served"}];

/* ── Draw department ranking chart ─────────────────────────────── */
export function drawDeptRanking(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const rowH = 14;
  const labelW = 190;
  const barZone = 280;
  const annotW = 80;
  const totalW = labelW + barZone + annotW;
  const topPad = 36;
  const n = DEPTS.length;
  const totalH = topPad + n * rowH + 8;

  const maxRatio = 2.2;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
  svg.setAttribute('width', '100%');
  svg.setAttribute('preserveAspectRatio', 'xMinYMin meet');
  svg.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';
  svg.style.display = 'block';

  const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bg.setAttribute('width', totalW); bg.setAttribute('height', totalH);
  bg.setAttribute('fill', '#faf7f2');
  svg.appendChild(bg);

  function el(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Column headers
  svg.appendChild(el('text', {x: 0, y: 20, fill: '#888', 'font-size': 9, 'font-weight': '600', 'letter-spacing': '1'}, 'DEPARTMENT'));
  svg.appendChild(el('text', {x: labelW + barZone / 2, y: 20, fill: '#888', 'font-size': 9, 'font-weight': '600', 'text-anchor': 'middle'}, 'BARS PER 1,000 RESIDENTS →'));
  svg.appendChild(el('text', {x: totalW - 2, y: 20, fill: '#888', 'font-size': 9, 'font-weight': '600', 'text-anchor': 'end'}, '% IN DESERT'));

  DEPTS.forEach((d, i) => {
    const isCorse = d.corsica;
    const rowY = topPad + i * rowH;
    const midY = rowY + rowH / 2;

    // Row background
    if (i % 2 === 0) {
      svg.appendChild(el('rect', {x: 0, y: rowY, width: totalW, height: rowH, fill: isCorse ? '#fff3e6' : '#f5f1ea'}));
    } else if (isCorse) {
      svg.appendChild(el('rect', {x: 0, y: rowY, width: totalW, height: rowH, fill: '#fff3e6'}));
    }

    // Rank
    svg.appendChild(el('text', {x: 4, y: midY + 3.5, fill: isCorse ? '#d4640a' : '#bbb', 'font-size': 8}, `${i + 1}`));

    // Name
    svg.appendChild(el('text', {
      x: 20, y: midY + 3.5,
      fill: isCorse ? '#d4640a' : '#1a1a1a',
      'font-size': 10,
      'font-weight': isCorse ? '700' : '400'
    }, d.name));

    // Bar
    const barW = Math.max(2, (d.ratio / maxRatio) * barZone);
    svg.appendChild(el('rect', {
      x: labelW, y: midY - 4,
      width: barW, height: 8,
      fill: isCorse ? '#d4640a' : '#8a9ab0',
      opacity: isCorse ? '1' : '0.75'
    }));

    // Ratio label on bar
    if (d.ratio >= 0.5 || isCorse) {
      svg.appendChild(el('text', {
        x: labelW + barW + 3, y: midY + 3.5,
        fill: isCorse ? '#d4640a' : '#555',
        'font-size': 9,
        'font-weight': isCorse ? '700' : '400'
      }, d.ratio.toFixed(2)));
    }

    // % desert right column
    const desertColor = d.pct_desert > 40 ? '#c0392b' : d.pct_desert > 20 ? '#d4860a' : '#555';
    svg.appendChild(el('text', {
      x: totalW - 2, y: midY + 3.5,
      fill: desertColor, 'font-size': 9, 'text-anchor': 'end'
    }, `${d.pct_desert.toFixed(0)}%`));
  });

  container.appendChild(svg);
}

/* ── Draw Corsica scatter plot ──────────────────────────────────── */
export function drawCorseScatter(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = 560, H = 340;
  const padL = 50, padR = 20, padT = 20, padB = 50;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const maxBars = 14;   // bars per 1000 axis max
  const maxApl = 16;    // APL axis max

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.fontFamily = 'var(--sans, "Helvetica Neue", sans-serif)';
  svg.style.display = 'block';

  function el(tag, attrs, text) {
    const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Background
  svg.appendChild(el('rect', {width: W, height: H, fill: '#faf7f2'}));

  // Chart area
  const plotX = (v) => padL + (v / maxBars) * chartW;
  const plotY = (v) => padT + chartH - (v / maxApl) * chartH;

  // Grid lines
  for (const v of [2.5, 5, 7.5, 10, 12.5]) {
    const x = plotX(v);
    svg.appendChild(el('line', {x1: x, y1: padT, x2: x, y2: padT + chartH, stroke: '#ddd', 'stroke-width': '0.5'}));
  }
  for (const v of [2.5, 5, 7.5, 10, 12.5, 15]) {
    const y = plotY(v);
    svg.appendChild(el('line', {x1: padL, y1: y, x2: padL + chartW, y2: y, stroke: '#ddd', 'stroke-width': '0.5'}));
  }

  // APL=2.5 desert threshold line
  const y25 = plotY(2.5);
  svg.appendChild(el('line', {x1: padL, y1: y25, x2: padL + chartW, y2: y25, stroke: '#c0392b', 'stroke-width': '1', 'stroke-dasharray': '4,3'}));
  svg.appendChild(el('text', {x: padL + 3, y: y25 - 4, fill: '#c0392b', 'font-size': 8}, 'desert threshold (APL 2.5)'));

  // APL=0 band at bottom
  const y0 = plotY(0);
  const yband = plotY(0.3);
  svg.appendChild(el('rect', {x: padL, y: yband, width: chartW, height: y0 - yband, fill: '#fce8e8', opacity: '0.5'}));
  svg.appendChild(el('text', {x: padL + chartW - 4, y: y0 - 4, fill: '#c0392b', 'font-size': 8, 'text-anchor': 'end'}, 'APL = 0 zone'));

  // Dots
  CORSE_COMMS.forEach(c => {
    if (!c.pop || c.pop === 0) return;
    const barsR = Math.min(c.bars_r, maxBars - 0.1);
    const aplV = Math.min(c.apl, maxApl - 0.1);
    const cx = plotX(barsR);
    const cy = plotY(aplV);

    // Size by log(pop)
    const r = Math.max(2, Math.min(10, 2 + Math.log(c.pop) / Math.log(10) * 1.5));

    // Color: coastal (high APL) = orange, desert (APL=0) = red, other = blue-gray
    let fill, opacity;
    if (c.apl === 0) { fill = '#c0392b'; opacity = '0.7'; }
    else if (c.apl >= 4) { fill = '#d4640a'; opacity = '0.8'; }
    else if (c.apl >= 2.5) { fill = '#8aaa60'; opacity = '0.7'; }
    else { fill = '#6a8ab0'; opacity = '0.7'; }

    svg.appendChild(el('circle', {cx, cy, r, fill, opacity}));
  });

  // Axis ticks and labels — X axis
  svg.appendChild(el('line', {x1: padL, y1: padT + chartH, x2: padL + chartW, y2: padT + chartH, stroke: '#999', 'stroke-width': '1'}));
  for (const v of [0, 5, 10]) {
    const x = plotX(v);
    svg.appendChild(el('line', {x1: x, y1: padT + chartH, x2: x, y2: padT + chartH + 4, stroke: '#999', 'stroke-width': '1'}));
    svg.appendChild(el('text', {x, y: padT + chartH + 14, 'text-anchor': 'middle', fill: '#666', 'font-size': 9}, v.toString()));
  }
  svg.appendChild(el('text', {x: padL + chartW / 2, y: H - 4, 'text-anchor': 'middle', fill: '#555', 'font-size': 10}, 'Bars per 1,000 residents'));

  // Y axis
  svg.appendChild(el('line', {x1: padL, y1: padT, x2: padL, y2: padT + chartH, stroke: '#999', 'stroke-width': '1'}));
  for (const v of [0, 5, 10, 15]) {
    const y = plotY(v);
    svg.appendChild(el('line', {x1: padL - 4, y1: y, x2: padL, y2: y, stroke: '#999', 'stroke-width': '1'}));
    svg.appendChild(el('text', {x: padL - 7, y: y + 3.5, 'text-anchor': 'end', fill: '#666', 'font-size': 9}, v.toString()));
  }
  svg.appendChild(el('text', {
    x: 12, y: padT + chartH / 2,
    'text-anchor': 'middle', fill: '#555', 'font-size': 10,
    transform: `rotate(-90 12 ${padT + chartH / 2})`
  }, 'APL score (GP access)'));

  // Legend
  const legendX = padL + 10, legendY = padT + 8;
  const legendItems = [
    {fill: '#d4640a', label: 'APL ≥ 4.0 — tourist coast'},
    {fill: '#8aaa60', label: 'APL 2.5–4.0 — adequate'},
    {fill: '#6a8ab0', label: 'APL 0.1–2.5 — desert'},
    {fill: '#c0392b', label: 'APL = 0 — no access'},
  ];
  legendItems.forEach((item, i) => {
    svg.appendChild(el('circle', {cx: legendX + 5, cy: legendY + i * 14 + 4, r: 4, fill: item.fill}));
    svg.appendChild(el('text', {x: legendX + 14, y: legendY + i * 14 + 8, fill: '#444', 'font-size': 9}, item.label));
  });

  container.appendChild(svg);
}
