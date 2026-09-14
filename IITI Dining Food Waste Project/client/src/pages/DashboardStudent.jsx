import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import { uploadImageFile } from '../lib/uploadImage.js'
import { MESS_OPTIONS } from '../lib/constants.js'
import { TICKET_TEMPLATES, FEEDBACK_TEMPLATES } from '../lib/templates.js'
import { MenuViewer } from '../components/MenuPanel.jsx'

export default function DashboardStudent() {
  const [desc, setDesc] = useState('')
  const [category, setCategory] = useState('quality')
  const [rating, setRating] = useState(5)
  const [comments, setComments] = useState('')
  const [meal, setMeal] = useState('lunch')
  const [isAnonymous, setAnon] = useState(false)
  const [tickets, setTickets] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [ticketMess, setTicketMess] = useState(MESS_OPTIONS[0])
  const [feedbackMess, setFeedbackMess] = useState(MESS_OPTIONS[0])
  const [ticketImage, setTicketImage] = useState(null)
  const [ticketUploading, setTicketUploading] = useState(false)
  const [ticketErr, setTicketErr] = useState('')

  useEffect(() => {
    api.get('/tickets/mine').then(r => setTickets(r.data)).catch(()=>{})
  }, [])

  const submitTicket = async (e) => {
    e.preventDefault()
    setTicketErr('')
    if (!desc.trim()) return
    let imageUrl
    if (ticketImage) {
      setTicketUploading(true)
      try {
        imageUrl = await uploadImageFile(ticketImage)
      } catch {
        setTicketErr('Photo upload failed. Try again.')
        setTicketUploading(false)
        return
      }
      setTicketUploading(false)
    }
    await api.post('/tickets', { category, description: desc.trim(), mess: ticketMess, imageUrl })
    setDesc('')
    setTicketImage(null)
    const r = await api.get('/tickets/mine')
    setTickets(r.data)
  }

  const submitFeedback = async (e) => {
    e.preventDefault()
    await api.post('/feedback', { date: new Date().toISOString(), meal, rating: Number(rating), isAnonymous, comments, mess: feedbackMess })
    setComments('')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-green-100">Raise tickets and share your feedback</p>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border-2 border-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold">Feedback Submitted!</p>
              <p className="text-sm text-green-100">Thank you for your feedback</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Raise Ticket Card */}
        <div className="bg-gradient-to-br from-white to-orange-50 p-6 rounded-xl shadow-lg border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Raise Ticket</h2>
          </div>
          <form onSubmit={submitTicket} className="space-y-4">
            {ticketErr ? <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{ticketErr}</div> : null}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mess</label>
              <select className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-white" value={ticketMess} onChange={e=>setTicketMess(e.target.value)}>
                {MESS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none bg-white" value={category} onChange={e=>setCategory(e.target.value)}>
                <option value="quality">Quality</option>
                <option value="hygiene">Hygiene</option>
                <option value="service">Service</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick templates - Click to use:
                </p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {TICKET_TEMPLATES[category]?.map((template, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDesc(template)}
                      className="text-xs px-3 py-1.5 bg-white border border-orange-200 text-orange-700 rounded-full hover:bg-orange-50 hover:border-orange-300 hover:shadow-sm transition-all duration-200 font-medium whitespace-nowrap"
                    >
                      {template.substring(0, 40)}...
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none resize-none" 
                placeholder="Describe the issue or select a template above..." 
                rows="4"
                value={desc} 
                onChange={e=>setDesc(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                onChange={(e) => setTicketImage(e.target.files?.[0] || null)}
              />
              {ticketImage ? (
                <p className="text-xs text-gray-500 mt-1">Selected: {ticketImage.name}</p>
              ) : null}
            </div>
            <button
              disabled={ticketUploading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:opacity-60 text-white font-semibold px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {ticketUploading ? 'Uploading photo…' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Submit Feedback Card */}
        <div className="bg-gradient-to-br from-white to-pink-50 p-6 rounded-xl shadow-lg border border-pink-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Submit Feedback</h2>
          </div>
          <form onSubmit={submitFeedback} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mess</label>
              <select className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none bg-white" value={feedbackMess} onChange={e=>setFeedbackMess(e.target.value)}>
                {MESS_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meal</label>
              <select className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none bg-white" value={meal} onChange={e=>setMeal(e.target.value)}>
                <option>breakfast</option>
                <option>lunch</option>
                <option>dinner</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating (1-5)</label>
              <div className="flex items-center gap-2">
                <input 
                  className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none" 
                  type="number" 
                  min="1" 
                  max="5" 
                  value={rating} 
                  onChange={e=>setRating(e.target.value)} 
                />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      className={`w-6 h-6 ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick templates - Click to use:
                </p>
                <div className="space-y-2">
                  {rating >= 4 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-xs font-semibold text-green-700 w-full">Positive Feedback:</span>
                      {FEEDBACK_TEMPLATES.positive.map((template, idx) => (
                        <button
                          key={`pos-${idx}`}
                          type="button"
                          onClick={() => setComments(template)}
                          className="text-xs px-3 py-1.5 bg-white border border-green-200 text-green-700 rounded-full hover:bg-green-50 hover:border-green-300 hover:shadow-sm transition-all duration-200 font-medium"
                        >
                          {template.substring(0, 35)}...
                        </button>
                      ))}
                    </div>
                  )}
                  {rating === 3 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                      <span className="text-xs font-semibold text-yellow-700 w-full">Constructive Feedback:</span>
                      {FEEDBACK_TEMPLATES.constructive.map((template, idx) => (
                        <button
                          key={`con-${idx}`}
                          type="button"
                          onClick={() => setComments(template)}
                          className="text-xs px-3 py-1.5 bg-white border border-yellow-200 text-yellow-700 rounded-full hover:bg-yellow-50 hover:border-yellow-300 hover:shadow-sm transition-all duration-200 font-medium"
                        >
                          {template.substring(0, 35)}...
                        </button>
                      ))}
                    </div>
                  )}
                  {rating <= 2 && (
                    <div className="flex flex-wrap gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-xs font-semibold text-red-700 w-full">Areas for Improvement:</span>
                      {FEEDBACK_TEMPLATES.negative.map((template, idx) => (
                        <button
                          key={`neg-${idx}`}
                          type="button"
                          onClick={() => setComments(template)}
                          className="text-xs px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-full hover:bg-red-50 hover:border-red-300 hover:shadow-sm transition-all duration-200 font-medium"
                        >
                          {template.substring(0, 35)}...
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <textarea 
                className="w-full border-2 border-gray-200 p-3 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all outline-none resize-none" 
                placeholder="Describe your experience or select a template above..." 
                rows="3"
                value={comments} 
                onChange={e=>setComments(e.target.value)} 
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isAnonymous} 
                onChange={e=>setAnon(e.target.checked)}
                className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
              /> 
              Submit anonymously
            </label>
            <button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold px-4 py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Submit Feedback
            </button>
          </form>
        </div>
      </div>

      <MenuViewer />

      {/* My Tickets Card */}
      <div className="md:col-span-2 bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-lg border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">My Tickets</h2>
        </div>
        <div className="space-y-3">
          {tickets.length > 0 ? (
            tickets.map((t, idx) => (
              <div 
                key={t._id} 
                className={`bg-white border-2 rounded-xl p-4 shadow-md hover:shadow-lg transition-all ${
                  t.status === 'resolved' 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                        t.category === 'quality' ? 'bg-purple-100 text-purple-700' :
                        t.category === 'hygiene' ? 'bg-red-100 text-red-700' :
                        t.category === 'service' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'resolved' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {t.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">{t.mess || 'Unknown'}</span>
                    </div>
                    <p className="text-gray-800 font-medium mb-1">{t.description}</p>
                    {t.imageUrl ? (
                      <div className="mt-2">
                        <a href={t.imageUrl} target="_blank" rel="noreferrer" className="text-sm text-orange-700 font-medium hover:underline">
                          View attached photo
                        </a>
                        <div className="mt-2 max-w-xs rounded-lg border overflow-hidden">
                          <img src={t.imageUrl} alt="" className="w-full h-32 object-cover" />
                        </div>
                      </div>
                    ) : null}
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-lg font-medium">No tickets yet</p>
              <p className="text-gray-400 text-sm mt-1">Raise a ticket to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


