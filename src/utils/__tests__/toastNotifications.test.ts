import { describe, it, expect, vi, beforeEach } from 'vitest'
import { showErrorToast, showSuccessToast, showInfoToast } from '../toastNotifications'

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

describe('Toast Notifications', () => {
  const mockMessage = 'Test message'
  const mockConsoleError = vi.spyOn(console, 'error')

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showErrorToast', () => {
    it('should call toast.error with correct options', async () => {
      const { toast } = await import('react-toastify')
      showErrorToast(mockMessage)

      expect(toast.error).toHaveBeenCalledWith(mockMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    })

    it('should log error to console', () => {
      showErrorToast(mockMessage)
      expect(mockConsoleError).toHaveBeenCalledWith('Error:', mockMessage)
    })

    it('should return the message', () => {
      const result = showErrorToast(mockMessage)
      expect(result).toBe(mockMessage)
    })
  })

  describe('showSuccessToast', () => {
    it('should call toast.success with correct options', async () => {
      const { toast } = await import('react-toastify')
      showSuccessToast(mockMessage)

      expect(toast.success).toHaveBeenCalledWith(mockMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    })
  })

  describe('showInfoToast', () => {
    it('should call toast.info with correct options', async () => {
      const { toast } = await import('react-toastify')
      showInfoToast(mockMessage)

      expect(toast.info).toHaveBeenCalledWith(mockMessage, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    })
  })
}) 