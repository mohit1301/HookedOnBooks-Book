const express = require('express')
const router = express.Router()
const axios = require('axios')
const Book = require('../models/bookModel')
const { Types } = require('mongoose')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// Get Book by Author Id
router.get('/getByAuthorId', async (req, res) => {
  try {
    const books = await Book.find({ author: new Types.ObjectId(req.query.id) }).limit(6).exec()
    res.send(books)
  } catch (error) {
    res.send([])
  }
})

// New Book Route
router.get('/new', async (req, res) => {
  const accessToken = req.accessToken
  renderNewPage(accessToken, res, new Book())
})

//
router.get('/recentlyAdded', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: 'desc' }).limit(10).exec()
    res.render('index', {
      books: books
    })
  } catch (error) {
    res.render('books/index', {
      errorMessage: 'An error occurred'
    })
  }
})

// Show Book Route
router.get('/:id', async (req, res) => {
  try {
    const accessToken = req.accessToken
    const book = await Book.findById(req.params.id)
    const authorResponse = await axios.get(`${process.env.AUTHOR_BASEURL}/authors/getById?id=${book.author}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })
    const bookWithAuthor = {
      book: book,
      authorDetails: authorResponse.data
    };
    res.render('books/show', {
      bookWithAuthor: bookWithAuthor
    })
  } catch (error) {
    res.redirect('/books')
  }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
  const accessToken = req.accessToken
  try {
    const book = await Book.findById(req.params.id)
    renderEditPage(accessToken, res, book)
  } catch {
    res.redirect('/')
  }
})

// All Books Route
router.get('/', async (req, res) => {
  let query = Book.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const books = await query.exec()
    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/books')
  }
})

// Create Book Route
router.post('/', async (req, res) => {
  const accessToken = req.accessToken
  const refreshToken = req.refreshToken
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(book, req.body.cover)

  try {
    const newBook = await book.save()
    res.redirect(`books/${newBook.id}`)
  } catch (error) {
    console.log('Inside error of books. access token when calling the authors from book =', accessToken)
    renderNewPage(accessToken, refreshToken, res, book, true)
  }
})

// Update Book Route
router.put('/:id', async (req, res) => {
  let book
  const accessToken = req.accessToken

  try {
    book = await Book.findById(req.params.id)
    book.title = req.body.title
    book.author = req.body.author
    book.publishDate = new Date(req.body.publishDate)
    book.pageCount = req.body.pageCount
    book.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(book, req.body.cover)
    }
    await book.save()
    res.redirect(`/books/${book.id}`)
  } catch {
    if (book != null) {
      renderEditPage(accessToken, res, book, true)
    } else {
      redirect('/books')
    }
  }
})

// Delete Book Page
router.delete('/:id', async (req, res) => {
  let book
  let bookWithAuthor
  const accessToken = req.accessToken
  try {
    book = await Book.findByIdAndDelete(req.params.id)
    const authorResponse = await axios.get(`${process.env.AUTHOR_BASEURL}/authors/getById?id=${book.author}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
    bookWithAuthor = {
      book: book,
      authorDetails: authorResponse.data
    };
    res.redirect('/books')
  } catch (error) {
    if (book == null) {
      res.render('books/show', {
        bookWithAuthor: bookWithAuthor,
        errorMessage: 'Could not remove book'
      })
    } else {
      res.redirect('/books')
    }
  }
})


async function renderNewPage(accessToken, refreshToken, res, book, hasError = false) {
  renderFormPage(accessToken, refreshToken, res, book, 'new', hasError)
}

async function renderEditPage(accessToken, res, book, hasError = false) {
  renderFormPage(accessToken, res, book, 'edit', hasError)
}

async function renderFormPage(accessToken, refreshToken, res, book, form, hasError = false) {
  try {
    const authors = await axios.get(`${process.env.AUTHOR_BASEURL}/authors/getAllAuthors`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Refresh-Token': refreshToken
      }
    });
    const params = {
      authors: authors.data,
      book: book
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`books/${form}`, params)
  } catch (error) {
    console.log('error in books ===', error)
    res.redirect('/books')
  }
}

function saveCover(book, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    book.coverImage = new Buffer.from(cover.data, 'base64')
    book.coverImageType = cover.type
  }
}

module.exports = router