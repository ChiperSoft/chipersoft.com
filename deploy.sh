git checkout master
git subtree split --prefix build -b gh-pages
git push -f gh-pages gh-pages:master
git push -f origin master:master
git branch -D gh-pages