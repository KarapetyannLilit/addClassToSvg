const srcSvg = process.argv[2]
const dstSvg = process.argv[3]
const fs = require("fs")
const xmldom = require("xmldom")
const cheerio = require("cheerio")

const addClassesToSvg = (srcSvg, dstSvg) => {
  fs.readFile(srcSvg, { encoding: "utf-8" }, (err, data) => {
    if (!err) {
      const svgHTML = new xmldom.DOMParser().parseFromString(
        data,
        "image/svg+xml"
      )
      const svgList = svgHTML.getElementsByTagName("svg")
      if (!svgList) {
        console.log("error not found")
      }
      const svg = svgList.item(0)
      svg.setAttribute("width", "300px")
      let num = 0
      const serializer = new xmldom.XMLSerializer()
      const serialized = serializer.serializeToString(svgHTML)
      const $ = cheerio.load(serialized, null, false)

      const addClassName = (node) => {
        if (
          !(
            node.name === "defs" ||
            node.name === "style" ||
            node.name === "title"
          )
        ) {
          if (node.attribs) {
            if (!node.attribs.class) {
              node.attribs.class = `changable-color-${num}`
              if (node.attribs.fill) {
                const fill = node.attribs.fill
                if (fill.includes("url")) {
                  const url = fill.replace("url(", "").replace(")", "")
                  $(`${url}`)[0].children.map((child) => {
                    if (child.attribs) {
                      child.attribs.class += ` ${child.attribs.id}`
                    }
                  })
                }
              }
              if (node.attribs.stroke) {
                const stroke = node.attribs.stroke
                if (stroke.includes("url")) {
                  const url = stroke.replace("url(", "").replace(")", "")
                  $(`${url}`)[0].children.map((child) => {
                    child.attribs.class += ` ${child.attribs.id}`
                  })
                }
              }
              num++
            } else if (node.attribs.class) {
              node.attribs.class += ` changable-color-${num}`
              $("style").text().includes(node.attribs.class)
              num++
            }
          }
        }
      }

      const findEachChild = (node) => {
        if (node) {
          const children = node.children
          if (children && children.length) {
            children.forEach((child) => {
              findEachChild(child)
            })
          } else {
            addClassName(node)
          }
        }
      }
      findEachChild($("svg")[0])
      console.log($.html())

      fs.promises
        .writeFile(`${dstSvg}`, $.html())
        .then(() => {
          console.log("The file has been saved!")
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      console.log("err")
    }
  })
}

addClassesToSvg(srcSvg, dstSvg)
