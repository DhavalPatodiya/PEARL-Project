import csv
from datetime import datetime, timedelta
import nltk
from nltk import word_tokenize
from nltk.stem.snowball import SnowballStemmer
import numpy as np
from copkmeans.cop_kmeans import cop_kmeans
import math

nltk.download('punkt')

tweets_and_timestamps = []

with open('preprocess_data/tweets_barackobama.csv') as csv_file:
    csv_reader = csv.DictReader(csv_file)
    line_count = 0

    for row in csv_reader:
        if line_count > 0:
            tokenized_words = word_tokenize(row["Tweet Content"])
            stemmer = SnowballStemmer(language = "english")
            stemmed_words = []
            for word in tokenized_words:
                stemmed_word = stemmer.stem(word)
                stemmed_words.append(stemmed_word)
            dt = datetime.strptime(row["Tweet Posted Time"], "%d/%m/%Y %H:%M")
            details = [row["Tweet Content"],stemmed_words, dt]
            tweets_and_timestamps.append(details)
        line_count += 1

word_emotion_map = dict()

with open('NRCLexicon.csv') as nrc_lex_file:
    csv_reader = csv.reader(nrc_lex_file, delimiter=',')
    for row in csv_reader:
        if row[2] == '1' and not row[1]=='positive' and not row[1]=='negative':
            if not row[0] in word_emotion_map.keys():
                word_emotion_map[row[0]] = [[]]
            word_emotion_map[row[0]][0].append(row[1])

with open('ANEWLexicon.csv') as anew_lex_file:
    csv_reader = csv.reader(anew_lex_file, delimiter=',')
    line_count = 0

    for row in csv_reader:
        if line_count > 0:
            if row[0] in word_emotion_map.keys():
                vals = [row[2],row[4],row[6]]
                word_emotion_map[row[0]].append(vals)
        line_count += 1

for key in list(word_emotion_map):
    if len(word_emotion_map[key]) < 2:
        del word_emotion_map[key]

tweet_emotions = []
tweet_removed = set()

for tweet_details in tweets_and_timestamps:
    tweet_emotion_details = [tweet_details[0], [], []]
    stemmed_words = tweet_details[1]
    for word in stemmed_words:
        if word in word_emotion_map.keys():
            emotion_details = word_emotion_map[word]
            tweet_emotion_details[1].append(word)
            tweet_emotion_details[2].append(emotion_details)
    if len(tweet_emotion_details[1]) > 0:
        tweet_emotions.append(tweet_emotion_details)
    else:
        tweet_removed.add(tweet_details[0])

tweet_matrices = []

for tweet in tweet_emotions:
    intensities = dict()
    valence = dict()
    arousal = dict()
    dominance = dict()
    total = len(tweet[1])

    intensities['joy'] = 0
    intensities['trust'] = 0
    intensities['fear'] = 0
    intensities['surprise'] = 0
    intensities['sadness'] = 0
    intensities['disgust'] = 0
    intensities['anger'] = 0
    intensities['anticipation'] = 0

    dominance['joy'] = 0
    dominance['trust'] = 0
    dominance['fear'] = 0
    dominance['surprise'] = 0
    dominance['sadness'] = 0
    dominance['disgust'] = 0
    dominance['anger'] = 0
    dominance['anticipation'] = 0

    valence['joy'] = 0
    valence['trust'] = 0
    valence['fear'] = 0
    valence['surprise'] = 0
    valence['sadness'] = 0
    valence['disgust'] = 0
    valence['anger'] = 0
    valence['anticipation'] = 0

    arousal['joy'] = 0
    arousal['trust'] = 0
    arousal['fear'] = 0
    arousal['surprise'] = 0
    arousal['sadness'] = 0
    arousal['disgust'] = 0
    arousal['anger'] = 0
    arousal['anticipation'] = 0

    for emotion_details in tweet[2]:
        for emotion in emotion_details[0]:
            if emotion in intensities.keys():
                intensities[emotion] = intensities[emotion] + 1
                valence[emotion] = valence[emotion] + float(emotion_details[1][0])
                arousal[emotion] = arousal[emotion] + float(emotion_details[1][1])
                dominance[emotion] = dominance[emotion] + float(emotion_details[1][2])

    for key in list(valence):
        if valence[key] > 0:
            valence[key] = valence[key]/intensities[key]
    
    for key in list(arousal):
        if arousal[key] > 0:
            arousal[key] = arousal[key]/intensities[key]

    for key in list(dominance):
        if dominance[key] > 0:
            dominance[key] = dominance[key]/intensities[key]

    for key in list(intensities):
        intensities[key] = intensities[key]/total

    tweet_matrix = [tweet[0], intensities, valence, arousal, dominance]
    tweet_matrices.append(tweet_matrix)


np_arrays = []
dominant_emotion_arr = []

for tweet_matrix in tweet_matrices:
    intensities = tweet_matrix[1]
    valence = tweet_matrix[2]
    arousal = tweet_matrix[3]
    dominance = tweet_matrix[4]

    dominant = ""
    found = False
    for key in list(intensities):
        if intensities[key] == 1:
            if not found:
                found = True
                dominant = key
            else:
                found = False
                break

    if(found):
        dominant_emotion_arr.append(dominant)
    else:
        dominant_emotion_arr.append("")
    
    parameters = np.array((list(intensities.values()) + list(valence.values()) + list(arousal.values()) + list(dominance.values())))
    np_arrays.append(parameters)

combined = np.vstack(np_arrays)
must_link = []
cannot_link = []
start = None
end= None
count = 0
for idx, x in enumerate(tweets_and_timestamps):
    if(x[0] not in tweet_removed):
        if count == 0:
            end = x[2]
        elif count == (len(tweet_matrices) - 1):
            start = x[2]

        current_date = x[2]
        end_date = current_date + timedelta(days=7)
        start_date = current_date - timedelta(days=7)

        count2=0
        for idx2, x2 in enumerate(tweets_and_timestamps):
            if(x2[0] not in tweet_removed):
                if (count2>count):
                    new_date = x2[2]
                    if ((start_date > new_date) or (end_date < new_date)):
                        cannot_link.append((count, count2))
                    else:
                        if(dominant_emotion_arr[count]!= "" and (dominant_emotion_arr[count] == dominant_emotion_arr[count2])):
                            must_link.append((count, count2))
                count2 = count2 + 1
        count = count + 1

# print(len(combined))
# weeks_in_year = 81
# clusters, centers = cop_kmeans(dataset=combined, k=weeks_in_year, ml=must_link,cl=cannot_link)

# if centers is None:
#     print("Please increase number of clusters!")
# else:
#     print(clusters)

cutoff_date = end - timedelta(days=7)

tweet_clusters_temp = [[cutoff_date, end, [], [], [], []]]

count = 0

for idx, x in enumerate(tweets_and_timestamps):
    if(x[0] not in tweet_removed):
        current_date = x[2]
        cutoff_date = end - timedelta(days=7)
        while current_date < cutoff_date:
            end = cutoff_date - timedelta(days=1)
            cutoff_date = end - timedelta(days=7)
            tweet_clusters_temp.insert(0,[cutoff_date, end, [], [], [], []])
        tweet_clusters_temp[0][2].append(np_arrays[count])
        tweet_clusters_temp[0][3].extend(tweet_emotions[count][1])
        tweet_clusters_temp[0][4].append(x[2])
        tweet_clusters_temp[0][5].append(x[0])
        count = count + 1

tweet_clusters = []
start = tweet_clusters_temp[0][0]
end = tweet_clusters_temp[0][1]

for idx, x in enumerate(tweet_clusters_temp):
    if(len(x[3])!=0):
        tweet_clusters.append([start, end, x[2],x[3],x[4], x[5]])
        if(idx < len(tweet_clusters_temp)-1):
            start = tweet_clusters_temp[idx+1][0]
            end = tweet_clusters_temp[idx+1][1]
    else:
        if(idx < len(tweet_clusters_temp)-1):
            end = tweet_clusters_temp[idx+1][1]

final_vals = []
final_vals_2 = []


for cluster in tweet_clusters:
    start_string = cluster[0].strftime("%d/%m/%Y")
    end_string = cluster[1].strftime("%d/%m/%Y")
    row_entry = [start_string, end_string]
    tweet_count = len(cluster[2])
    if tweet_count > 0:
        stacked_cluster = np.vstack(cluster[2])
        averaged_vals = np.mean(stacked_cluster, axis=0)
        row_entry.extend(list(averaged_vals))        
    else:
        zero_vals = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        row_entry.extend(zero_vals)
    final_vals.append(row_entry)

headers = ['Start Date', 'End Date', 'Intensity Joy', 'Intensity Trust', 'Intensity Fear', 
'Intensity Surprise', 'Intensity Sadness', 'Intensity Disgust', 'Intensity Anger', 'Intensity Anticipation', 'Valence Joy', 'Valence Trust', 'Valence Fear', 
'Valence Surprise', 'Valence Sadness', 'Valence Disgust', 'Valence Anger', 'Valence Anticipation', 'Arousal Joy', 'Arousal Trust', 'Arousal Fear', 
'Arousal Surprise', 'Arousal Sadness', 'Arousal Disgust', 'Arousal Anger', 'Arousal Anticipation', 'Dominance Joy', 'Dominance Trust', 'Dominance Fear', 
'Dominance Surprise', 'Dominance Sadness', 'Dominance Disgust', 'Dominance Anger', 'Dominance Anticipation']

with open('segmented_parameters.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)

    writer.writerow(headers)

    writer.writerows(final_vals)


unique_words_frequencies = []
word_document_count = dict()
max_tweets_single_cluster = 0

for cluster in tweet_clusters:
    tweet_count = len(cluster[2])
    max_tweets_single_cluster = max(max_tweets_single_cluster, tweet_count)
    if tweet_count > 0:
        word_freq = dict()
        for word in cluster[3]:
            if word in word_freq.keys():
                word_freq[word] = word_freq[word] + 1
            else:
                word_freq[word] = 1
                if word in word_document_count.keys():
                    word_document_count[word] = word_document_count[word] + 1
                else:
                    word_document_count[word] = 1
        unique_words_frequencies.append(word_freq)
    else:
        unique_words_frequencies.append(None)

total_docs = len(unique_words_frequencies)

trigger_words_lists = []

for idx, cluster in enumerate(tweet_clusters):
    tweet_count = len(cluster[2])
    if tweet_count > 0:
        tf_idf_scores = dict()
        for key in list(unique_words_frequencies[idx]):
            freq = unique_words_frequencies[idx][key]
            log_factor = total_docs / word_document_count[key]
            fact2 = math.log2(log_factor)
            score = freq * fact2
            tf_idf_scores[key] = score
        trigger_words_lists.append(sorted(tf_idf_scores, key=tf_idf_scores.get))
    else:
        trigger_words_lists.append([])


headers_2 = ['Start Date', 'End Date','Trigger Words', 'Tweet Count']
cnt = 0
while cnt < max_tweets_single_cluster:
    headers_2.append('Tweet'+str(cnt))
    headers_2.append('Tweet'+str(cnt)+' Timestamp')
    cnt = cnt + 1
final_vals_2 = []

for idx, cluster in enumerate(tweet_clusters):
    start_string = cluster[0].strftime("%d/%m/%Y")
    end_string = cluster[1].strftime("%d/%m/%Y")
    tweet_count = len(cluster[2])
    row_entry = [start_string, end_string, trigger_words_lists[idx], tweet_count]
    if tweet_count > 0:
        for idx2, tweet in enumerate(cluster[5]):
            row_entry.append(tweet)
            row_entry.append(cluster[4][idx2])
    count = tweet_count
    while count < max_tweets_single_cluster:
        row_entry.append("")
        row_entry.append("")
        count = count + 1
    final_vals_2.append(row_entry)

with open('tweet_triggers_timestamps.csv', 'w', encoding='UTF8', newline='') as f:
    writer = csv.writer(f)

    writer.writerow(headers_2)

    writer.writerows(final_vals_2)



