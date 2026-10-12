// Config plugin de Expo: sube el destino minimo de iOS de todos los pods a 15.0.
// Xcode 26+ rechaza compilar targets con IPHONEOS_DEPLOYMENT_TARGET < 15.0, y
// react-native-svg (su bundle RNSVGFilters) sigue declarando 12.4. Como ios/ es
// una carpeta generada (npx expo prebuild), el arreglo vive aqui y no en el
// Podfile, para que sobreviva a cada regeneracion.
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs'); const path = require('path');
const MARCA = '# BlueDot: destino minimo de los pods';
const HOOK = `    ${MARCA}
    installer.pods_project.targets.each do |t|
      t.build_configurations.each do |c|
        if c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.0
          c.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
        end
      end
    end
`;
module.exports = function withPodsTarget(config) {
  return withDangerousMod(config, ['ios', async (config) => {
    const p = path.join(config.modRequest.platformProjectRoot, 'Podfile');
    let s = fs.readFileSync(p, 'utf8');
    if (!s.includes(MARCA)) s = s.replace(/post_install do \|installer\|\n/, (m) => m + HOOK);
    fs.writeFileSync(p, s);
    return config;
  }]);
};
