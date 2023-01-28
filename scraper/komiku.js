const { findAll, update } = require("../database/mysql");
const axiosService = require("../libraries/axiosService");

const url = "https://komiku.id";
const getData = async () => {
  const komiks = await findAll("komiks");
  komiks.forEach(async (komik) => {
    try {
      const response = await axiosService(`${url}/manga/${komik.slug}`);

      const $ = cheerio.load(response);

      const title = $("h1")
        .text()
        .replace(/\n/g, "")
        .trim()
        .replace("Komik ", "");
      const sub_title = $(".j2").text().replace(/\n/g, "").trim();
      const description = $(".desc").text().replace(/\n/g, "").trim();
      const thumbnail = $(".ims").find("img").attr("src");
      const table = $(".inftable");
      const type = table
        .find("tr")
        .eq(1)
        .find("td")
        .eq(1)
        .text()
        .replace(/\n/g, "")
        .trim();
      const author = table
        .find("tr")
        .eq(3)
        .find("td")
        .eq(1)
        .text()
        .replace(/\n/g, "")
        .trim();
      const status = table
        .find("tr")
        .eq(4)
        .find("td")
        .eq(1)
        .text()
        .replace(/\n/g, "")
        .trim();
      const genres = $("ul.genre")
        .find("li")
        .map((i, el) => {
          return $(el).text().replace(/\n/g, "").trim();
        })
        .get();
      const chapter_table = $("._3Rsjq");
      const chapters = chapter_table
        .find("tr")
        .map((i, el) => {
          if (i !== 0) {
            return {
              title: $(el)
                .find("td")
                .eq(0)
                .find("a")
                .text()
                .replace(/\n/g, "")
                .trim(),
              url: $(el)
                .find("td")
                .eq(0)
                .find("a")
                .attr("href")
                .replace("/ch/", "")
                .replace("/", ""),
              date: $(el).find("td").eq(1).text().replace(/\n/g, "").trim(),
            };
          }
        })
        .get();

      chapters.reverse();

      await Promise.all(
        genres.forEach(async (genre) => {
          const cek_genre = await findFirst("genres", {
            name: genre,
          });

          if (!cek_genre) {
            const new_genre = await create("genres", {
              name: genre,
              slug: genre.toLowerCase().replace(" ", "-"),
              created_at: new Date(),
              updated_at: new Date(),
            });

            await create("komik_genres", {
              komik_id: komik.id,
              genre_id: new_genre.insertId,
            });
          }

          const cek_komik_genre = await findFirst("komik_genres", {
            komik_id: komik.id,
            genre_id: cek_genre.id,
          });

          if (!cek_komik_genre) {
            await create("komik_genres", {
              komik_id: komik.id,
              genre_id: cek_genre.id,
            });
          }
        })
      );

      await Promise.all(
        chapters.map(async (chapter) => {
          const cek_chapter = await findFirst("chapters", {
            komik_id: komik.id,
            title: chapter.title,
          });

          if (!cek_chapter) {
            const new_chapter = await create("chapters", {
              komik_id: komik.id,
              title: chapter.title,
              slug: chapter.url,
              created_at: new Date(),
              updated_at: new Date(),
            });
          }
        })
      );

      await update(
        "komiks",
        {
          alias: sub_title,
          description: description,
          thumbnail: thumbnail,
          type: type,
          author: author,
          status: status,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: komik.id,
        }
      );

      console.log(`Komik ${title} berhasil diupdate`);
    } catch (error) {
      console.log(error);
    }
  });
};

getData();
