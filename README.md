# The-Last-Book-Bender

## Dataset

We will be using the `good-books-10k-extended` [dataset](https://github.com/malcolmosh/goodbooks-10k-extended), and the `Gutenberg Project` [datasets](http://aleph.gutenberg.org/).

The `good-books-10k-extended` has about 50k users, 10k books, 6M ratings. The Guteberg Project includes over 70,000 ebooks, and you can read more about their work here: https://www.gutenberg.org/

The good-books dataset is available for immediate download, while the Gutenberg dataset takes a bit more time and effort. 

We developed a simple script, "Gutenberg Parser.py" to scrape the books, apply basic filters to remove audio books and non-Enlgish language books.
The script was also used to transform the data, choosing a few fields, and condesing the content of th ebooks into a 512 word normalized sample, usable with BERT.
You are welcome to remove block comments at line 60 to execute a short run for testing. There is one additional block comment at line 180/181 to remove, in that case. 
If you prefer to skip the scraping process, and would like to run the models with the entire dataset, you can download it, pre-processed, here: 
https://drive.google.com/file/d/10AAICyWTe-9GJPhtF2-d9ilpobGBA7Wv/view?usp=drive_link

We developed also a simple collaborative filtering model based on the `good-books-10k-extended` dataset. The model is given in `Notebooks/cf_model.py`, the initialization data (processed user-item matrix, with rows indexed by `book_id`, columns indexed by `user_id`, is given in `Data/Raw/ratings_for_cf.npz`. The metrics we chose to use is an approximate version of the adjusted cosine similarity, based on an 10-fold CV we ran testing with different metrics (other metrics are the basic cosine similarity paired with rating remapping methods or fixed baseline adjustments).

## Visualizations and Interactivities
