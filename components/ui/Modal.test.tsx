import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal Component', () => {
  describe('Rendering', () => {
    it('renders modal when open is true', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Test Modal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Modal content</p>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      );
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal when open is false', () => {
      render(
        <Modal open={false} onClose={() => {}}>
          <Modal.Content>
            <Modal.Title>Hidden Modal</Modal.Title>
          </Modal.Content>
        </Modal>
      );
      
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(screen.queryByText('Hidden Modal')).not.toBeInTheDocument();
    });

    it('renders backdrop overlay', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Content</Modal.Content>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toBeInTheDocument();
      expect(backdrop).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
    });
  });

  describe('Modal Sizes', () => {
    it('applies small size styles', () => {
      render(
        <Modal open size="sm" onClose={() => {}}>
          <Modal.Content>Small Modal</Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('max-w-sm');
    });

    it('applies medium size styles (default)', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Medium Modal</Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('max-w-md');
    });

    it('applies large size styles', () => {
      render(
        <Modal open size="lg" onClose={() => {}}>
          <Modal.Content>Large Modal</Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('max-w-lg');
    });

    it('applies extra large size styles', () => {
      render(
        <Modal open size="xl" onClose={() => {}}>
          <Modal.Content>XL Modal</Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('max-w-xl');
    });

    it('applies full size styles', () => {
      render(
        <Modal open size="full" onClose={() => {}}>
          <Modal.Content>Full Modal</Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('max-w-full', 'h-full');
    });
  });

  describe('Modal Interactions', () => {
    it('calls onClose when backdrop is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal open onClose={handleClose}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when backdrop click is disabled', () => {
      const handleClose = vi.fn();
      render(
        <Modal open onClose={handleClose} closeOnBackdropClick={false}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      fireEvent.click(screen.getByTestId('modal-backdrop'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed', () => {
      const handleClose = vi.fn();
      render(
        <Modal open onClose={handleClose}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close when Escape key is disabled', () => {
      const handleClose = vi.fn();
      render(
        <Modal open onClose={handleClose} closeOnEscape={false}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal open onClose={handleClose}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Title</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );
      
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Focus Management', () => {
    it('focuses the modal content when opened', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <button>First focusable</button>
            <button>Second focusable</button>
          </Modal.Content>
        </Modal>
      );
      
      expect(screen.getByText('First focusable')).toHaveFocus();
    });

    it('traps focus within modal', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <button>First</button>
            <button>Last</button>
          </Modal.Content>
        </Modal>
      );
      
      const firstButton = screen.getByText('First');
      const lastButton = screen.getByText('Last');
      
      // Tab from last button should go to first
      lastButton.focus();
      fireEvent.keyDown(lastButton, { key: 'Tab' });
      expect(firstButton).toHaveFocus();
      
      // Shift+Tab from first button should go to last
      fireEvent.keyDown(firstButton, { key: 'Tab', shiftKey: true });
      expect(lastButton).toHaveFocus();
    });

    it('restores focus to trigger element when closed', () => {
      const triggerButton = document.createElement('button');
      triggerButton.textContent = 'Open Modal';
      document.body.appendChild(triggerButton);
      triggerButton.focus();
      
      const { rerender } = render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      rerender(
        <Modal open={false} onClose={() => {}}>
          <Modal.Content>Modal Content</Modal.Content>
        </Modal>
      );
      
      expect(triggerButton).toHaveFocus();
      document.body.removeChild(triggerButton);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Accessible Modal</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>This modal is accessible</p>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('associates title with dialog using aria-labelledby', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Modal Title</Modal.Title>
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      const title = screen.getByText('Modal Title');
      
      expect(dialog.getAttribute('aria-labelledby')).toBe(title.getAttribute('id'));
    });

    it('associates body with dialog using aria-describedby', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Body>
              <p>Modal description</p>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      );
      
      const dialog = screen.getByRole('dialog');
      const body = screen.getByText('Modal description').closest('[id]');
      
      expect(dialog.getAttribute('aria-describedby')).toBe(body?.getAttribute('id'));
    });

    it('has proper close button accessibility', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Header>
              <Modal.CloseButton />
            </Modal.Header>
          </Modal.Content>
        </Modal>
      );
      
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal');
    });
  });

  describe('Portal Rendering', () => {
    it('renders modal in document.body by default', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Portal Modal</Modal.Content>
        </Modal>
      );
      
      expect(document.body).toContainElement(screen.getByRole('dialog'));
    });

    it('renders modal in custom container when provided', () => {
      const customContainer = document.createElement('div');
      customContainer.id = 'modal-root';
      document.body.appendChild(customContainer);
      
      render(
        <Modal open onClose={() => {}} container={customContainer}>
          <Modal.Content>Custom Portal Modal</Modal.Content>
        </Modal>
      );
      
      expect(customContainer).toContainElement(screen.getByRole('dialog'));
      document.body.removeChild(customContainer);
    });
  });

  describe('Animation and Transitions', () => {
    it('applies enter animation classes', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Animated Modal</Modal.Content>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      const content = screen.getByRole('dialog');
      
      expect(backdrop).toHaveClass('transition-opacity');
      expect(content).toHaveClass('transition-all', 'duration-300');
    });

    it('applies exit animation when closing', () => {
      const { rerender } = render(
        <Modal open onClose={() => {}}>
          <Modal.Content>Closing Modal</Modal.Content>
        </Modal>
      );
      
      rerender(
        <Modal open={false} onClose={() => {}}>
          <Modal.Content>Closing Modal</Modal.Content>
        </Modal>
      );
      
      // Modal should still be in DOM during exit animation
      expect(screen.queryByTestId('modal-backdrop')).toBeInTheDocument();
    });
  });

  describe('Compound Components', () => {
    it('renders complete modal structure', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>Complete Modal</Modal.Title>
              <Modal.CloseButton />
            </Modal.Header>
            <Modal.Body>
              <p>This is the modal body content.</p>
            </Modal.Body>
            <Modal.Footer>
              <button>Cancel</button>
              <button>Save</button>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      );
      
      expect(screen.getByText('Complete Modal')).toBeInTheDocument();
      expect(screen.getByText('This is the modal body content.')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('accepts custom className for modal content', () => {
      render(
        <Modal open onClose={() => {}}>
          <Modal.Content className="custom-modal">
            Custom Styled Modal
          </Modal.Content>
        </Modal>
      );
      
      const content = screen.getByRole('dialog');
      expect(content).toHaveClass('custom-modal');
    });

    it('accepts custom backdrop className', () => {
      render(
        <Modal open onClose={() => {}} backdropClassName="custom-backdrop">
          <Modal.Content>Modal with Custom Backdrop</Modal.Content>
        </Modal>
      );
      
      const backdrop = screen.getByTestId('modal-backdrop');
      expect(backdrop).toHaveClass('custom-backdrop');
    });
  });
});