//#############################################################################
// require helper node_modules and prepare helper methods and consts

const expect = require('chai').expect;
const fse = require('fs-extra');
const path = require('path');
const compare_version = require('compare-version');

const childproc = require('child_process');

const command = function(command, callback) {
    const proc = childproc.exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log('ERROR: ' + stderr);
        }
        callback(stdout, stderr);
    });
}

const path_to_jsfiddle_downloader = path.normalize(__dirname + '/../bin/jsfiddle-downloader.js');
if (! fse.pathExistsSync(path_to_jsfiddle_downloader)) {
  console.log(`ERROR: could not find file under test: ${path_to_jsfiddle_downloader}`);
  process.exit(1);
}

const keep_results = process.argv.includes('--keep'); // keep resulting directories and files for inspection

//#############################################################################
// tests for v0.1.6

describe('jsfiddle-downloader v0.1.6 and above has features as described in README', function() {

    this.timeout(10000);

    const tempdir = 'temp_test_results.0.1.6';

    before(function(done) { // check preconditions
        const __this = this;
        command(`${path_to_jsfiddle_downloader} --version`, function(stdout, stderr) {
          console.log(`  version detected ${stdout}`);
          if (stderr != '') {
              __this.skip();
          } else if (compare_version(stdout, '0.1.6') < 0) {
              __this.skip();
          } else { // remove previous results and prepare for the new test run
              fse.removeSync(tempdir);
              fse.mkdirSync(tempdir);
              process.chdir(tempdir);
          }
          done();
        })
    });

    after(function() {
        process.chdir('..');
        if (!keep_results) {
            fse.removeSync(tempdir);
        }
    });

    it('0.1.6-1 Download a single fiddle from its id, options -fi:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi ncmqqkdu`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`ncmqqkdu.html`)).to.not.throw; // default filename
          done();
      })
    });
    it('0.1.6-2 Download a single fiddle from its id, options -fi -o:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi ncmqqkdu -o temp1-o.html`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`temp1-o.html`)).to.not.throw; // specified filename
          done();
      })
    });

    it('0.1.6-3 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl https://jsfiddle.net/xheLmLgL/`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`xheLmLgL.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.6-4 Download a single fiddle from its url, options -fl -o:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl https://jsfiddle.net/xheLmLgL/ -o temp2-o.html`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`temp2-o.html`)).to.not.throw; // specified filename
          done();
      })
    });

    it('0.1.6-5 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/e2Lv2Lco/`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`e2Lv2Lco.html`)).to.not.throw;
          expect(fse.accessSync(`xheLmLgL.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-6 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/HLafm/1`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`HLafm.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-7 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl https://jsfiddle.net/070zp1qk/show`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`070zp1qk.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-8 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl https://jsfiddle.net/goxjbcqu/1`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`goxjbcqu.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-9 Download a single fiddle from its url, options -fl:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl https://jsfiddle.net/FacuCode/hyzfkc4m/show`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`hyzfkc4m.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-10 Download all scripts of a user from jsFiddle.net, options -fu:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('output_dir').length).to.be.at.least(123); // default dir
          expect(fse.accessSync(`output_dir/2w2K8.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.6-11 Download all scripts of a user from jsFiddle.net, options -fu -o:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode -o temp_dir`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('temp_dir').length).to.be.at.least(123); // specified dir
          expect(fse.accessSync(`temp_dir/2w2K8.html`)).to.not.throw;
          done();
      })
    });
});

describe('jsfiddle-downloader v0.1.7 has additional features as described in README', function() {

    this.timeout(10000);

    const tempdir = 'temp_test_results.0.1.7';

    before(function(done) { // check preconditions
        const __this = this;
        command(`${path_to_jsfiddle_downloader} --version`, function(stdout, stderr) {
          console.log(`  version detected ${stdout}`);
          if (stderr != '') {
              __this.skip();
          } else if (compare_version(stdout, '0.1.7') < 0) {
              __this.skip();
          } else { // remove previous results and prepare for the new test run
              fse.removeSync(tempdir);
              fse.mkdirSync(tempdir);
              process.chdir(tempdir);
          }
          done();
        })
    });

    after(function() {
        process.chdir('..');
        if (!keep_results) {
            fse.removeSync(tempdir);
        }
    });

    it('0.1.7-1 Download a single fiddle from its id, options -fi -I:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi jghfjgcu -I`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`jghfjgcu.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-2 Download a single fiddle from its id, options -fi -T:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi x41r981y -T`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`Cubo_girando_en_3D_by_FacuCode.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-3 Download a single fiddle from its id, options -fi -TS:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi s79qr06L -TS`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`JavaScript scroll down. by FacuCode.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-4 Download a single fiddle from its id, options -fi -IT:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fi rsno3fn4 -IT`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`rsno3fn4_planos_paralelos_girando_en_3D_by_FacuCode.html`)).to.not.throw; // generated filename
          done();
      })
    });

    it('0.1.7-5 Download a single fiddle from its url, options -fl -I:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/peqdxrj5/ -I`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`peqdxrj5.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-6 Download a single fiddle from its url, options -fl -T:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/pwon7bL8/ -T`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`Ejemplo_de_contadores_by_FacuCode.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-7 Download a single fiddle from its url, options -fl -TS:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/q5xde/ -TS`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`Ovalo con CSS puro by FacuCode.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-8 Download a single fiddle from its url, options -fl -IT:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fl jsfiddle.net/FacuCode/s9f4zwas/ -IT`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.accessSync(`s9f4zwas_CSS_2D_Transforms_CON_ANTIALIASING!_by_FacuCode.html`)).to.not.throw; // default filename
          done();
      })
    });

    it('0.1.7-9 Download all scripts of a user from jsFiddle.net, options -fu -I:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode -I`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('output_dir').length).to.be.at.least(123); // default dir
          expect(fse.accessSync(`output_dir/kdqyK.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.7-10 Download all scripts of a user from jsFiddle.net, options -fu -T:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode -T`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('output_dir').length).to.be.at.least(123+121); // default dir
          expect(fse.accessSync(`output_dir/Efectos_de_imagenes_con_CSS_by_FacuCode.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.7-11 Download all scripts of a user from jsFiddle.net, options -fu -TS:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode -TS`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('output_dir').length).to.be.at.least(123+121+121); // default dir
          expect(fse.accessSync(`output_dir/Efectos de imagenes con CSS by FacuCode.html`)).to.not.throw;
          done();
      })
    });

    it('0.1.7-12 Download all scripts of a user from jsFiddle.net, options -fu -IT:', function(done) {
      command(`${path_to_jsfiddle_downloader} -fu FacuCode -IT`, function(stdout, stderr) {
          expect(stderr).to.equal('');
          expect(fse.readdirSync('output_dir').length).to.be.at.least(123+121+121+123); // default dir
          expect(fse.accessSync(`output_dir/kdqyK_Efectos_de_imagenes_con_CSS_by_FacuCode.html`)).to.not.throw;
          done();
      })
    });

});
