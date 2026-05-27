content = open('vendedor.html', encoding='utf-8').read()

old1 = "var MACHETAZO_USERS = ['CECILIA VALDES','ALEXIS VAZQUEZ','MANUEL VALDEZ','EDUARDO LÓPEZ','ELEIDI FRANCO','ADESSA COOK','ERICK RUIZ','PEDRO RODRIGUEZ','IRVING TORRES','BELTRAN FRANCO GONZALEZ','JAAZIEL GONZALEZ','SAMUEL BARRIA'];"
new1 = "var MACHETAZO_USERS = MACHETAZO_TIENDAS.map(function(t){ return t.v.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); });"

old2 = "if (navMachetazo) navMachetazo.style.display = MACHETAZO_USERS.indexOf(VENDOR_ACTUAL) !== -1 ? '' : 'none';"
new2 = "var vNorm = VENDOR_ACTUAL.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); if (navMachetazo) navMachetazo.style.display = MACHETAZO_USERS.indexOf(vNorm) !== -1 ? '' : 'none';"

content = content.replace(old1, new1)
content = content.replace(old2, new2)

open('vendedor.html', 'w', encoding='utf-8').write(content)
print('Listo')
