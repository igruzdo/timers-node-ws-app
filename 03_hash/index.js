const fs = require("fs");
const crypto = require("crypto");

class TxtFile {
  constructor() {
    this.path = process.argv[2];
    this.txt = this.tryToRead();
    this.hash = this.setHash();
  }

  tryToRead() {
    try {
      return fs.readFileSync(this.path);
    } catch (err) {
      console.error(err);
      process.exit(100);
    }
  }

  setHash() {
    console.log(this.txt);
    const hash = crypto.createHash("sha256");
    return hash.update(this.txt).digest("hex");
  }
}

class HashFile {
  constructor() {
    this.path = `${process.argv[2]}.sha256`;
    this.hash = this.tryToRead();
  }

  tryToRead() {
    try {
      return fs.readFileSync(this.path, "utf8").trim();
    } catch (err) {
      console.error(err);
      process.exit(101);
    }
  }
}

const file = new TxtFile();
const hash = new HashFile();

if (file.hash == hash.hash) {
  console.log("OK");
  process.exit(0);
} else {
  console.error("Хеши файлов не совпадают");
  process.exit(102);
}
